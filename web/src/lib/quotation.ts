import { getClient } from './payload'
import { notifyStaff } from './notify'
import { storeDocuments, type UploadInput } from './uploads'
import { calculate, type ComponentInput, type RoomInput } from './calc'
import { trackSiteEvent } from './analytics'

export type QuotationInput = {
  customerName: string
  phone: string
  email?: string
  location?: string
  projectType?: string
  interiorExterior?: 'interior' | 'exterior'
  budget?: string
  branchId?: number
  rooms: RoomInput[]
  topcoatProductId?: number
  topcoatCoats?: number
  includePrimer?: boolean
  primerProductId?: number
  primerCoats?: number
  wastePct?: number
  consent: boolean
  honeypot?: string
}

export type QuotationResult = { ok: boolean; reference?: string; error?: string; notified?: boolean }

const RETENTION_MS = 2 * 365 * 24 * 60 * 60 * 1000

async function buildComponent(
  payload: Awaited<ReturnType<typeof getClient>>,
  key: 'primer' | 'topcoat',
  label: string,
  productId: number | undefined,
  coats: number,
  appliesTo: 'walls' | 'both',
): Promise<ComponentInput | null> {
  if (!productId) return null
  const product = await payload.findByID({ collection: 'products', id: productId, depth: 0, overrideAccess: true }).catch(() => null)
  if (!product) return null
  const cov = typeof product.coveragePerLitre === 'number' ? product.coveragePerLitre : 0
  const verified = product.verification?.status === 'verified' && cov > 0
  return {
    key,
    label,
    coats,
    coverage: verified ? cov : null, // never invent coverage
    productId,
    productName: product.name,
    packSizes: (product.packSizes ?? []).map((x) => x.litres).filter((n): n is number => typeof n === 'number' && n > 0),
    appliesTo,
  }
}

export async function submitQuotation(input: QuotationInput, files: UploadInput[] = []): Promise<QuotationResult> {
  // Spam honeypot — silently reject bots.
  if (input.honeypot && input.honeypot.trim() !== '') return { ok: false, error: 'Submission blocked.' }
  if (!input.customerName?.trim() || !input.phone?.trim()) return { ok: false, error: 'Name and phone are required.' }
  if (!input.consent) return { ok: false, error: 'Please accept the consent to be contacted.' }
  if (!input.rooms?.length) return { ok: false, error: 'Add at least one room.' }

  const payload = await getClient()

  // Recompute authoritatively (never trust client numbers).
  const components: ComponentInput[] = []
  const topcoat = await buildComponent(payload, 'topcoat', 'Topcoat', input.topcoatProductId, input.topcoatCoats ?? 2, 'both')
  if (topcoat) components.push(topcoat)
  if (input.includePrimer) {
    const primer = await buildComponent(payload, 'primer', 'Primer / undercoat', input.primerProductId, input.primerCoats ?? 1, 'both')
    if (primer) components.push(primer)
  }
  const calc = calculate(input.rooms, components, { wastePct: input.wastePct })
  if (calc.issues.length) return { ok: false, error: calc.issues[0].message }

  // Uploads (BOQ / images / documents)
  let boqFiles: { file: number }[] = []
  if (files.length) {
    try {
      const ids = await storeDocuments(payload, files, 'boq')
      boqFiles = ids.map((file) => ({ file }))
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'File upload failed.' }
    }
  }

  const totalArea = Math.round((calc.totals.wallArea + calc.totals.ceilingArea) * 100) / 100
  const productsInterested = [input.topcoatProductId, input.includePrimer ? input.primerProductId : undefined].filter(
    (v): v is number => typeof v === 'number',
  )
  const consent = { given: true, purpose: 'service_request', channel: 'website', timestamp: new Date().toISOString() }
  const retention = { retainUntil: new Date(Date.now() + RETENTION_MS).toISOString(), legalBasis: 'consent' }

  const quote = await payload.create({
    collection: 'quotation-requests',
    data: {
      customerName: input.customerName,
      phone: input.phone,
      email: input.email,
      projectType: input.projectType,
      interiorExterior: input.interiorExterior,
      area: totalArea,
      budget: input.budget,
      calculation: calc as unknown as Record<string, unknown>,
      boqFiles,
      productsInterested,
      preferredBranch: input.branchId,
      status: 'received',
      consent,
      retention,
    } as never,
    overrideAccess: true,
  })
  const ref = (quote as { reference?: string }).reference

  // Save a linked lead too ("save the calculation with the lead").
  await payload
    .create({
      collection: 'leads',
      data: {
        name: input.customerName,
        phone: input.phone,
        email: input.email,
        source: 'quotation',
        interest: input.projectType || 'Paint quotation',
        message: `Quotation ${ref ?? ''} — approx ${totalArea} m². See quotation request for the full calculation.`,
        branch: input.branchId,
        consent,
        retention,
      } as never,
      overrideAccess: true,
    })
    .catch((e) => payload.logger.error(`[quotation] lead create failed: ${e}`))

  // Notify staff
  const summary = calc.components.map((c) => `${c.label}: ${c.litres == null ? 'coverage not verified' : c.litres + ' L'}`)
  const notified = await notifyStaff(payload, `New quotation request ${ref ?? ''}`, [
    `Customer: ${input.customerName}`,
    `Phone: ${input.phone}`,
    input.email ? `Email: ${input.email}` : '',
    `Area: ${totalArea} m²`,
    ...summary,
    boqFiles.length ? `Documents: ${boqFiles.length}` : '',
    'NOTE: figures are estimates requiring site verification.',
  ].filter(Boolean))

  // Confirmation to the customer (best-effort)
  if (input.email) {
    try {
      await payload.sendEmail({
        to: input.email,
        subject: `[Hilty] Your quotation request ${ref ?? ''}`,
        text: [
          `Hi ${input.customerName},`,
          '',
          `Thank you for your quotation request. Your reference is ${ref ?? ''}.`,
          `Estimated area: ${totalArea} m².`,
          ...summary,
          '',
          'These figures are estimates and require confirmation after a site inspection.',
          'Our team will be in touch shortly.',
          '',
          'Hilty Paint & Coatings Centre',
        ].join('\n'),
      })
    } catch (e) {
      payload.logger.error(`[quotation] customer email failed: ${e}`)
    }
  }

  await trackSiteEvent('quote_requested', { ref, payload })
  if (boqFiles.length) await trackSiteEvent('boq_uploaded', { ref, payload })
  return { ok: true, reference: ref, notified }
}
