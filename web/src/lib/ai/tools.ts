import { getClient } from '../payload'
import { relName } from '../format'
import { calculate, type ComponentInput, type RoomInput } from '../calc'
import { notifyStaff } from '../notify'
import { SITE } from '../site'
import type { ToolCall, ToolExecutor } from './types'

/** Tool definitions shared by both providers (name/description/JSON-schema parameters). */
export const TOOL_DEFINITIONS = [
  {
    name: 'search_products',
    description: 'Search the verified Hilty product catalogue. Returns only real catalogue products. Use before recommending anything.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        query: { type: 'string', description: 'Keywords, e.g. "exterior emulsion".' },
        category_key: { type: ['string', 'null'], description: 'Optional category key, e.g. interior_paint.' },
        use_type: { type: ['string', 'null'], description: 'Optional: interior, exterior, roof, wood, metal.' },
      },
      required: ['query', 'category_key', 'use_type'],
    },
  },
  {
    name: 'get_product_details',
    description: 'Get full details for one catalogue product by id. Price is only shown if verified; otherwise "Request current price". Stock is always "Contact branch for availability".',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: { product_id: { type: 'integer' } },
      required: ['product_id'],
    },
  },
  {
    name: 'calculate_paint_requirements',
    description: 'Deterministically calculate paint litres. NEVER compute this yourself. Coverage is used only when the product is verified.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        rooms: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              length: { type: 'number' }, width: { type: 'number' }, height: { type: 'number' },
              doors: { type: 'integer' }, windows: { type: 'integer' }, include_ceiling: { type: 'boolean' },
            },
            required: ['length', 'width', 'height', 'doors', 'windows', 'include_ceiling'],
          },
        },
        topcoat_product_id: { type: ['integer', 'null'] },
        topcoat_coats: { type: 'integer' },
        include_primer: { type: 'boolean' },
        primer_product_id: { type: ['integer', 'null'] },
        waste_pct: { type: 'number' },
      },
      required: ['rooms', 'topcoat_product_id', 'topcoat_coats', 'include_primer', 'primer_product_id', 'waste_pct'],
    },
  },
  {
    name: 'get_branch_details',
    description: 'List Hilty branches (name, region, phone, hours). Branch data is editable and may be pending confirmation.',
    parameters: { type: 'object', additionalProperties: false, properties: { query: { type: ['string', 'null'] } }, required: ['query'] },
  },
  {
    name: 'create_quote_lead',
    description: 'Create a quote-ready lead. REQUIRES explicit customer consent (consent=true). Returns a reference on success.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        name: { type: 'string' }, phone: { type: 'string' }, email: { type: ['string', 'null'] },
        project_summary: { type: 'string' }, consent: { type: 'boolean' },
      },
      required: ['name', 'phone', 'email', 'project_summary', 'consent'],
    },
  },
  {
    name: 'request_site_visit',
    description: 'Create a site-visit request. REQUIRES consent=true. Returns a reference on success.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        name: { type: 'string' }, phone: { type: 'string' }, location: { type: ['string', 'null'] }, consent: { type: 'boolean' },
      },
      required: ['name', 'phone', 'location', 'consent'],
    },
  },
  {
    name: 'handoff_to_human',
    description: 'Hand the customer to a human via WhatsApp/phone. Use for complaints, suspected counterfeit, product-quality issues, or when unsure.',
    parameters: { type: 'object', additionalProperties: false, properties: { reason: { type: 'string' } }, required: ['reason'] },
  },
] as const

export type ToolExecutorContext = {
  consentGiven?: boolean
  locale?: 'en' | 'sw'
}

const asNum = (v: unknown): number | undefined => (typeof v === 'number' && isFinite(v) ? v : undefined)
const asStr = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v.trim() : undefined)

async function loadVerifiedCoverage(payload: Awaited<ReturnType<typeof getClient>>, id?: number) {
  if (!id) return { coverage: null as number | null, name: undefined as string | undefined, packSizes: [] as number[] }
  const p = await payload.findByID({ collection: 'products', id, depth: 0, overrideAccess: true }).catch(() => null)
  if (!p) return { coverage: null, name: undefined, packSizes: [] }
  const cov = typeof p.coveragePerLitre === 'number' ? p.coveragePerLitre : 0
  const verified = p.verification?.status === 'verified' && cov > 0
  return {
    coverage: verified ? cov : null,
    name: p.name,
    packSizes: (p.packSizes ?? []).map((x) => x.litres).filter((n): n is number => typeof n === 'number' && n > 0),
  }
}

/**
 * Build the server-side tool executor. The model may REQUEST tools; the server validates
 * arguments and executes them. No unrestricted DB access; writes require consent.
 */
export function createToolExecutor(ctx: ToolExecutorContext = {}): ToolExecutor {
  return async (call: ToolCall): Promise<Record<string, unknown>> => {
    const a = call.arguments ?? {}
    const payload = await getClient()

    switch (call.name) {
      case 'search_products': {
        const query = asStr(a.query) ?? ''
        const where: Record<string, unknown> = { and: [{ active: { equals: true } }] as unknown[] }
        const and = where.and as Record<string, unknown>[]
        if (query) and.push({ or: [{ name: { like: query } }, { colourAvailability: { like: query } }] })
        const useType = asStr(a.use_type)
        if (useType) and.push({ useTypes: { contains: useType } })
        const res = await payload.find({ collection: 'products', where: where as never, limit: 8, depth: 1, overrideAccess: true })
        return {
          count: res.totalDocs,
          products: res.docs.map((d) => ({ id: d.id, name: d.name, brand: relName(d.brand), finish: d.finish ?? null, use_types: d.useTypes ?? [], category: relName(d.category) })),
        }
      }

      case 'get_product_details': {
        const id = asNum(a.product_id)
        if (!id) return { error: 'product_id required' }
        const d = await payload.findByID({ collection: 'products', id, depth: 1, overrideAccess: true }).catch(() => null)
        if (!d) return { error: 'not_found' }
        const priceVerified = d.pricing?.priceVerified && d.pricing?.showPricePublicly && typeof d.pricing?.price === 'number'
        return {
          id: d.id,
          name: d.name,
          brand: relName(d.brand),
          manufacturer_note: `Sold by Hilty; manufactured by ${relName(d.brand) || 'the brand owner'}.`,
          finish: d.finish ?? null,
          use_types: d.useTypes ?? [],
          coverage_m2_per_litre: d.verification?.status === 'verified' ? d.coveragePerLitre ?? null : null,
          coverage_verified: d.verification?.status === 'verified' && !!d.coveragePerLitre,
          pack_sizes_litres: (d.packSizes ?? []).map((x) => x.litres).filter(Boolean),
          price: priceVerified ? `${d.pricing?.price} ${d.pricing?.currency || 'TZS'}` : 'Request current price',
          stock: 'Contact branch for availability',
        }
      }

      case 'calculate_paint_requirements': {
        const roomsRaw = Array.isArray(a.rooms) ? (a.rooms as Record<string, unknown>[]) : []
        const rooms: RoomInput[] = roomsRaw.map((r) => ({
          length: asNum(r.length) ?? 0, width: asNum(r.width) ?? 0, height: asNum(r.height) ?? 0,
          doors: asNum(r.doors) ?? 0, windows: asNum(r.windows) ?? 0, includeCeiling: r.include_ceiling === true,
        }))
        const topcoat = await loadVerifiedCoverage(payload, asNum(a.topcoat_product_id))
        const comps: ComponentInput[] = []
        comps.push({ key: 'topcoat', label: 'Topcoat', coats: asNum(a.topcoat_coats) ?? 2, coverage: topcoat.coverage, productName: topcoat.name, packSizes: topcoat.packSizes, appliesTo: 'both' })
        if (a.include_primer === true) {
          const primer = await loadVerifiedCoverage(payload, asNum(a.primer_product_id))
          comps.push({ key: 'primer', label: 'Primer', coats: 1, coverage: primer.coverage, productName: primer.name, packSizes: primer.packSizes, appliesTo: 'both' })
        }
        const result = calculate(rooms, comps, { wastePct: asNum(a.waste_pct) })
        return { note: 'Estimate — requires site verification.', ...result }
      }

      case 'get_branch_details': {
        const res = await payload.find({ collection: 'branches', where: { active: { equals: true } }, limit: 20, depth: 0, overrideAccess: true })
        return {
          branches: res.docs.map((b) => ({ id: b.id, name: b.name, region: b.region ?? null, phone: b.phone ?? null, whatsapp: b.whatsapp ?? null })),
          note: 'Branch details are editable and may be pending owner confirmation.',
        }
      }

      case 'create_quote_lead': {
        const consent = a.consent === true && ctx.consentGiven !== false
        if (!consent) return { error: 'consent_required', message: 'Customer consent is required before storing a lead.' }
        const name = asStr(a.name)
        const phone = asStr(a.phone)
        if (!name || !phone) return { error: 'missing_fields', message: 'Name and phone are required.' }
        const lead = await payload.create({
          collection: 'leads',
          data: {
            name, phone, email: asStr(a.email), source: 'ai_advisor',
            interest: 'Paint advisor', message: asStr(a.project_summary),
            consent: { given: true, purpose: 'service_request', channel: 'ai_advisor', timestamp: new Date().toISOString() },
            retention: { retainUntil: new Date(Date.now() + 2 * 365 * 24 * 3600 * 1000).toISOString(), legalBasis: 'consent' },
          } as never,
          overrideAccess: true,
        })
        await notifyStaff(payload, 'New AI-advisor lead', [`Name: ${name}`, `Phone: ${phone}`])
        return { ok: true, reference: `LEAD-${(lead as { id: number }).id}` }
      }

      case 'request_site_visit': {
        const consent = a.consent === true && ctx.consentGiven !== false
        if (!consent) return { error: 'consent_required', message: 'Customer consent is required.' }
        const name = asStr(a.name)
        const phone = asStr(a.phone)
        if (!name || !phone) return { error: 'missing_fields' }
        const doc = await payload.create({
          collection: 'site-visit-requests',
          data: {
            name, phone, location: asStr(a.location),
            consent: { given: true, purpose: 'service_request', channel: 'ai_advisor', timestamp: new Date().toISOString() },
            retention: { retainUntil: new Date(Date.now() + 2 * 365 * 24 * 3600 * 1000).toISOString(), legalBasis: 'consent' },
          } as never,
          overrideAccess: true,
        })
        await notifyStaff(payload, 'New AI-advisor site-visit request', [`Name: ${name}`, `Phone: ${phone}`])
        return { ok: true, reference: (doc as { reference?: string }).reference ?? `VIS-${(doc as { id: number }).id}` }
      }

      case 'handoff_to_human': {
        return { ok: true, whatsapp: SITE.whatsappHref, phone: SITE.phone, message: 'A Hilty team member can help you on WhatsApp or by phone.' }
      }

      default:
        return { error: 'unknown_tool', tool: call.name }
    }
  }
}
