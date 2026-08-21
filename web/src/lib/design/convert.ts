import { getClient } from '../payload'
import { calculate, type RoomInput } from '../calc'
import { notifyStaff } from '../notify'
import { SITE } from '../site'
import { sendToOperations } from './ops'
import { trackDesignEvent } from './analytics'

const idOf = (v: unknown): number | undefined => (typeof v === 'number' ? v : v && typeof v === 'object' && 'id' in v ? (v as { id: number }).id : undefined)
const round2 = (n: number) => Math.round(n * 100) / 100

type BranchRow = { id: number; name?: string | null; region?: string | null }
function assignBranch(branches: BranchRow[], location?: string, preferredBranchId?: number): number | undefined {
  if (preferredBranchId) return preferredBranchId
  if (location) {
    const l = location.toLowerCase()
    const match = branches.find((b) => (b.region && l.includes(b.region.toLowerCase())) || (b.name && l.includes(b.name.toLowerCase())))
    if (match) return match.id
  }
  return branches[0]?.id
}

export type ConvertInput = {
  projectId: number
  name: string
  phone: string
  email?: string
  location?: string
  rooms: RoomInput[]
  paletteId?: number
  coats?: number
  wastePct?: number
  budget?: string
  timeline?: string
  siteVisitPreference?: string
  preferredBranchId?: number
  consent: boolean
}
export type ConvertResult =
  | { ok: true; reference: string; whatsapp: string; litres: number | null; opsDelivered: boolean; branchId?: number; followUpAt: string }
  | { ok: false; error: string }

/** Conversion automation: deterministic calc → lead → Operations → branch assignment → WhatsApp → notify → follow-up. */
export async function convertDesignToQuote(input: ConvertInput): Promise<ConvertResult> {
  if (!input.consent) return { ok: false, error: 'consent_required' }
  if (!input.name?.trim() || !input.phone?.trim()) return { ok: false, error: 'missing_fields' }
  if (!input.rooms?.length) return { ok: false, error: 'measurements_required' } // ask for measurements first

  const payload = await getClient()
  const project = await payload.findByID({ collection: 'design-projects', id: input.projectId, overrideAccess: true }).catch(() => null)
  if (!project) return { ok: false, error: 'project_not_found' }
  const reference = (project as { reference?: string }).reference || `DSN-${input.projectId}`

  // 3) Deterministic calc — coverage only from a VERIFIED product mapped in the palette.
  let coverage: number | null = null
  let productName: string | null = null
  let packSizes: number[] = []
  if (input.paletteId) {
    const pal = await payload.findByID({ collection: 'design-palettes', id: input.paletteId, overrideAccess: true }).catch(() => null)
    const main = ((pal?.roles ?? []) as { role?: string; product?: unknown }[]).find((r) => r.role === 'main')
    const topcoatId = idOf(main?.product)
    if (topcoatId) {
      const p = await payload.findByID({ collection: 'products', id: topcoatId, depth: 0, overrideAccess: true }).catch(() => null)
      const cov = typeof p?.coveragePerLitre === 'number' ? p.coveragePerLitre : 0
      coverage = p?.verification?.status === 'verified' && cov > 0 ? cov : null
      productName = p?.name ?? null
      packSizes = (p?.packSizes ?? []).map((x) => x.litres).filter((n): n is number => typeof n === 'number' && n > 0)
    }
  }
  const calc = calculate(input.rooms, [{ key: 'topcoat', label: 'Topcoat', coats: input.coats ?? 2, coverage, productName: productName ?? undefined, packSizes, appliesTo: 'both' }], { wastePct: input.wastePct ?? 10 })
  const litres = calc.components[0]?.litres ?? null
  const area = round2(calc.totals.wallArea + calc.totals.ceilingArea)
  const calcSummary = `Area ${area} m²; topcoat ${litres == null ? 'coverage to confirm' : litres + ' L'}`

  // Branch assignment (location/branch rules)
  const branches = (await payload.find({ collection: 'branches', where: { active: { equals: true } }, limit: 50, overrideAccess: true })).docs as BranchRow[]
  const branchId = assignBranch(branches, input.location, input.preferredBranchId ?? idOf(project.branch))

  // 4) Lead reference + lead (source = AI Design Studio)
  const consent = { given: true, purpose: 'service_request', channel: 'ai_advisor', timestamp: new Date().toISOString() }
  const message = [`Design ${reference}`, calcSummary, input.budget ? `Budget: ${input.budget}` : '', input.timeline ? `Timeline: ${input.timeline}` : '', input.siteVisitPreference ? `Site visit: ${input.siteVisitPreference}` : '', 'Source: AI Design Studio. Estimates require site verification.'].filter(Boolean).join('\n')
  await payload.create({ collection: 'leads', data: { name: input.name, phone: input.phone, email: input.email, source: 'design_studio', interest: 'AI Design Studio', message, branch: branchId, consent, retention: { retainUntil: new Date(Date.now() + 730 * 86400000).toISOString(), legalBasis: 'consent' } } as never, overrideAccess: true })

  await payload.update({ collection: 'design-projects', id: input.projectId, data: { quotationStatus: 'requested', status: 'converted', branch: branchId, location: input.location, consent } as never, overrideAccess: true })

  // 5) Send into Hilty Operations
  const ops = await sendToOperations(payload, { reference, projectId: input.projectId, branchId, contact: { name: input.name, phone: input.phone, email: input.email, location: input.location }, calcSummary, budget: input.budget, timeline: input.timeline })

  // 7) WhatsApp handoff with the reference
  const whatsapp = `${SITE.whatsappHref}?text=${encodeURIComponent(`Hello Hilty, my Design Studio reference is ${reference}. ${calcSummary}.`)}`

  // 8) Notify staff
  await notifyStaff(payload, `New Design Studio quotation ${reference}`, [`Name: ${input.name}`, `Phone: ${input.phone}`, calcSummary, branchId ? `Branch: ${branchId}` : ''].filter(Boolean))

  // 10) Schedule follow-up (configurable)
  const hours = Number(process.env.DESIGN_FOLLOWUP_HOURS) || 24
  const followUpAt = new Date(Date.now() + hours * 3600 * 1000).toISOString()

  // 6 / 9 analytics (metadata only)
  await trackDesignEvent(payload, 'quotation_requested', { projectId: input.projectId, branchId, leadRef: reference })
  await trackDesignEvent(payload, 'whatsapp_handoff', { projectId: input.projectId, branchId, leadRef: reference })
  await trackDesignEvent(payload, 'followup_scheduled', { projectId: input.projectId, branchId, leadRef: reference, meta: { dueAt: followUpAt, opsDelivered: ops.delivered } })

  return { ok: true, reference, whatsapp, litres, opsDelivered: ops.delivered, branchId, followUpAt }
}
