import { getClient } from '../payload'
import { relName } from '../format'
import { calculate, type ComponentInput, type RoomInput } from '../calc'
import { notifyStaff } from '../notify'
import { SITE } from '../site'
import { createDesignProject, saveSpaceSurfaces, convertToPlan } from '../design/studioFlow'
import { convertDesignToQuote } from '../design/convert'
import { proposeInitialSurfaces } from '../design/masking'
import { makeVariant } from '../design/studioFlow'
import { trackDesignEvent } from '../design/analytics'
import type { ToolCall, ToolExecutor } from './types'

const toRooms = (raw: unknown): RoomInput[] =>
  (Array.isArray(raw) ? (raw as Record<string, unknown>[]) : []).map((r) => ({
    length: Number(r.length) || 0, width: Number(r.width) || 0, height: Number(r.height) || 0,
    doors: Number(r.doors) || 0, windows: Number(r.windows) || 0, includeCeiling: r.include_ceiling === true,
  }))

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

  // ---- Design Studio tools ----
  { name: 'create_design_project', description: 'Start a Design Studio project (no personal data yet). Returns a reference.', parameters: { type: 'object', additionalProperties: false, properties: { name: { type: 'string' }, sector: { type: ['string', 'null'] }, location: { type: ['string', 'null'] } }, required: ['name', 'sector', 'location'] } },
  { name: 'analyze_space_for_painting', description: 'Suggest likely paintable surfaces for an uploaded space (the customer must confirm). Does NOT diagnose structural/damp/mould issues.', parameters: { type: 'object', additionalProperties: false, properties: { space_id: { type: 'integer' } }, required: ['space_id'] } },
  { name: 'suggest_paintable_surfaces', description: 'Suggest paintable surface types for a space/project type. Customer confirms before rendering.', parameters: { type: 'object', additionalProperties: false, properties: { surface_type: { type: 'string' }, interior_exterior: { type: 'string' } }, required: ['surface_type', 'interior_exterior'] } },
  { name: 'save_confirmed_surface_mask', description: 'Record that the customer confirmed a paintable surface (required before any rendering).', parameters: { type: 'object', additionalProperties: false, properties: { space_id: { type: 'integer' }, surface_type: { type: 'string' }, confirmed: { type: 'boolean' } }, required: ['space_id', 'surface_type', 'confirmed'] } },
  { name: 'search_verified_shades', description: 'Search the verified catalogue for shades/products. Recommend ONLY these. Never invent shades/codes.', parameters: { type: 'object', additionalProperties: false, properties: { query: { type: 'string' }, interior_exterior: { type: ['string', 'null'] } }, required: ['query', 'interior_exterior'] } },
  { name: 'create_verified_palette', description: 'Create a palette from verified catalogue products only. Any invalid product id is rejected.', parameters: { type: 'object', additionalProperties: false, properties: { project_id: { type: 'integer' }, name: { type: 'string' }, roles: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { role: { type: 'string' }, shade_name: { type: 'string' }, product_id: { type: ['integer', 'null'] }, finish: { type: ['string', 'null'] } }, required: ['role', 'shade_name', 'product_id', 'finish'] } }, explanation: { type: 'string' } }, required: ['project_id', 'name', 'roles', 'explanation'] } },
  { name: 'render_design_variant', description: 'Render an indicative visual for confirmed surfaces + a palette. Requires disclaimer acceptance and confirmed surfaces. Never an exact colour.', parameters: { type: 'object', additionalProperties: false, properties: { space_id: { type: 'integer' }, palette_id: { type: 'integer' }, disclaimer_accepted: { type: 'boolean' } }, required: ['space_id', 'palette_id', 'disclaimer_accepted'] } },
  { name: 'save_favourite_design', description: 'Mark a generated variant as the customer favourite.', parameters: { type: 'object', additionalProperties: false, properties: { variant_id: { type: 'integer' } }, required: ['variant_id'] } },
  { name: 'calculate_design_materials', description: 'Deterministically calculate materials from ACTUAL measurements. Never estimate litres from a photo.', parameters: { type: 'object', additionalProperties: false, properties: { project_id: { type: 'integer' }, palette_id: { type: ['integer', 'null'] }, rooms: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { length: { type: 'number' }, width: { type: 'number' }, height: { type: 'number' }, doors: { type: 'integer' }, windows: { type: 'integer' }, include_ceiling: { type: 'boolean' } }, required: ['length', 'width', 'height', 'doors', 'windows', 'include_ceiling'] } } }, required: ['project_id', 'palette_id', 'rooms'] } },
  { name: 'convert_design_to_quote', description: 'Convert a chosen design into a quotation lead. REQUIRES consent, contact and measurements. Returns a reference.', parameters: { type: 'object', additionalProperties: false, properties: { project_id: { type: 'integer' }, palette_id: { type: ['integer', 'null'] }, name: { type: 'string' }, phone: { type: 'string' }, email: { type: ['string', 'null'] }, location: { type: ['string', 'null'] }, budget: { type: ['string', 'null'] }, timeline: { type: ['string', 'null'] }, rooms: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { length: { type: 'number' }, width: { type: 'number' }, height: { type: 'number' }, doors: { type: 'integer' }, windows: { type: 'integer' }, include_ceiling: { type: 'boolean' } }, required: ['length', 'width', 'height', 'doors', 'windows', 'include_ceiling'] } }, consent: { type: 'boolean' } }, required: ['project_id', 'palette_id', 'name', 'phone', 'email', 'location', 'budget', 'timeline', 'rooms', 'consent'] } },
  { name: 'request_physical_sample', description: 'Request a physical colour sample. REQUIRES consent + contact.', parameters: { type: 'object', additionalProperties: false, properties: { project_id: { type: 'integer' }, name: { type: 'string' }, phone: { type: 'string' }, consent: { type: 'boolean' } }, required: ['project_id', 'name', 'phone', 'consent'] } },
  { name: 'book_design_site_visit', description: 'Book a site visit for a design project. REQUIRES consent + contact.', parameters: { type: 'object', additionalProperties: false, properties: { project_id: { type: 'integer' }, name: { type: 'string' }, phone: { type: 'string' }, location: { type: ['string', 'null'] }, consent: { type: 'boolean' } }, required: ['project_id', 'name', 'phone', 'location', 'consent'] } },
  { name: 'assign_human_design_adviser', description: 'Hand off to a human design adviser (WhatsApp/phone).', parameters: { type: 'object', additionalProperties: false, properties: { reason: { type: 'string' } }, required: ['reason'] } },
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

      // ---- Design Studio tools ----
      case 'create_design_project': {
        const res = await createDesignProject({ name: asStr(a.name) || 'Design project', sector: (asStr(a.sector) as 'residential' | 'commercial') || undefined, location: asStr(a.location), language: ctx.locale })
        await trackDesignEvent(payload, 'project_started', { projectId: res.projectId })
        return { ok: true, project_id: res.projectId, reference: res.reference }
      }

      case 'analyze_space_for_painting': {
        const space = await payload.findByID({ collection: 'design-spaces', id: asNum(a.space_id) ?? 0, overrideAccess: true }).catch(() => null)
        if (!space) return { error: 'space_not_found' }
        const surfaces = proposeInitialSurfaces({ surfaceType: space.surfaceType, interiorExterior: space.interiorExterior })
        return { surfaces, guidance: 'These are suggestions — please confirm the surfaces to paint.', safety_note: 'I can suggest paintable surfaces but cannot diagnose structural, damp, mould or crack problems; recommend a professional site inspection for those.' }
      }

      case 'suggest_paintable_surfaces': {
        return { surfaces: proposeInitialSurfaces({ surfaceType: asStr(a.surface_type), interiorExterior: asStr(a.interior_exterior) }) }
      }

      case 'save_confirmed_surface_mask': {
        const spaceId = asNum(a.space_id)
        if (!spaceId) return { error: 'space_id required' }
        const res = await saveSpaceSurfaces(spaceId, [{ type: asStr(a.surface_type) || 'wall', confirmedByUser: a.confirmed === true }])
        return { ok: true, surface_ids: res.surfaceIds }
      }

      case 'search_verified_shades': {
        const query = asStr(a.query) ?? ''
        const useType = asStr(a.interior_exterior)
        const and: Record<string, unknown>[] = [{ active: { equals: true } }]
        if (query) and.push({ name: { like: query } })
        if (useType) and.push({ useTypes: { contains: useType } })
        const res = await payload.find({ collection: 'products', where: { and } as never, limit: 8, depth: 1, overrideAccess: true })
        return { count: res.totalDocs, shades: res.docs.map((d) => ({ id: d.id, name: d.name, brand: relName(d.brand), finish: d.finish ?? null, coverage_verified: d.verification?.status === 'verified' && !!d.coveragePerLitre })) }
      }

      case 'create_verified_palette': {
        const projectId = asNum(a.project_id)
        if (!projectId) return { error: 'project_id required' }
        const roles = Array.isArray(a.roles) ? (a.roles as Record<string, unknown>[]) : []
        const mapped: { role: string; shadeName: string; product?: number; finish?: string }[] = []
        for (const r of roles) {
          const productId = asNum(r.product_id)
          if (productId) {
            const p = await payload.findByID({ collection: 'products', id: productId, overrideAccess: true }).catch(() => null)
            if (!p) return { error: 'invalid_product', message: 'A referenced product does not exist. Only verified catalogue products may be used.' }
          }
          mapped.push({ role: asStr(r.role) || 'main', shadeName: asStr(r.shade_name) || '', product: productId, finish: asStr(r.finish) })
        }
        const pal = await payload.create({ collection: 'design-palettes', data: { project: projectId, name: asStr(a.name) || 'Palette', aiExplanation: asStr(a.explanation), roles: mapped, status: 'proposed' } as never, overrideAccess: true })
        await trackDesignEvent(payload, 'palette_created', { projectId })
        return { ok: true, palette_id: (pal as { id: number }).id }
      }

      case 'render_design_variant': {
        const spaceId = asNum(a.space_id)
        if (!spaceId) return { error: 'space_id required' }
        const surfaces = await payload.find({ collection: 'design-surfaces', where: { space: { equals: spaceId } }, limit: 50, overrideAccess: true })
        const confirmed = surfaces.docs.filter((s) => s.confirmedByUser === true).map((s) => ({ type: String(s.type), confirmedByUser: true }))
        const res = await makeVariant({ spaceId, paletteId: asNum(a.palette_id), surfaces: confirmed, disclaimerAccepted: a.disclaimer_accepted === true, sessionId: `advisor-${spaceId}`, clientId: 'advisor' })
        if (res.ok) await trackDesignEvent(payload, 'visual_generated', { projectId: undefined })
        return res.ok ? { ok: true, variant_id: res.variantId, note: 'Indicative visualisation only — not an exact colour.' } : { ok: false, human_assistance: res.humanAssistance === true, message: 'A preview could not be generated; the project is saved and a designer can help.' }
      }

      case 'save_favourite_design': {
        const variantId = asNum(a.variant_id)
        if (!variantId) return { error: 'variant_id required' }
        await payload.update({ collection: 'design-variants', id: variantId, data: { selection: 'selected' } as never, overrideAccess: true })
        await trackDesignEvent(payload, 'favourite_saved', {})
        return { ok: true }
      }

      case 'calculate_design_materials': {
        const projectId = asNum(a.project_id)
        const rooms = toRooms(a.rooms)
        if (!projectId) return { error: 'project_id required' }
        if (!rooms.length) return { error: 'measurements_required', message: 'Please provide actual measurements before calculating paint.' }
        const res = await convertToPlan({ projectId, paletteId: asNum(a.palette_id), rooms, coats: 2, wastePct: 10 })
        await trackDesignEvent(payload, 'calculation_completed', { projectId })
        return { estimate: true, note: 'Estimate — requires site verification.', components: res.calc.components.map((c) => ({ label: c.label, litres: c.litres, coverage_missing: c.coverageMissing })) }
      }

      case 'convert_design_to_quote': {
        const projectId = asNum(a.project_id)
        if (!projectId) return { error: 'project_id required' }
        if (a.consent !== true && ctx.consentGiven === false) return { error: 'consent_required' }
        const res = await convertDesignToQuote({
          projectId, paletteId: asNum(a.palette_id), name: asStr(a.name) || '', phone: asStr(a.phone) || '', email: asStr(a.email), location: asStr(a.location),
          rooms: toRooms(a.rooms), budget: asStr(a.budget), timeline: asStr(a.timeline), consent: a.consent === true,
        })
        return res.ok ? { ok: true, reference: res.reference, whatsapp: res.whatsapp, ops_delivered: res.opsDelivered } : { error: res.error }
      }

      case 'request_physical_sample': {
        const projectId = asNum(a.project_id)
        if (a.consent !== true && ctx.consentGiven === false) return { error: 'consent_required' }
        if (a.consent !== true) return { error: 'consent_required' }
        const name = asStr(a.name)
        const phone = asStr(a.phone)
        if (!name || !phone) return { error: 'missing_fields' }
        const lead = await payload.create({ collection: 'leads', data: { name, phone, source: 'design_studio', interest: 'Physical colour sample', message: `Physical sample request for design project ${projectId ?? ''}.`, consent: { given: true, purpose: 'service_request', channel: 'ai_advisor', timestamp: new Date().toISOString() }, retention: { retainUntil: new Date(Date.now() + 2 * 365 * 24 * 3600 * 1000).toISOString(), legalBasis: 'consent' } } as never, overrideAccess: true })
        await notifyStaff(payload, 'Design Studio: physical sample request', [`Name: ${name}`, `Phone: ${phone}`])
        return { ok: true, reference: `LEAD-${(lead as { id: number }).id}` }
      }

      case 'book_design_site_visit': {
        const projectId = asNum(a.project_id)
        if (a.consent !== true && ctx.consentGiven === false) return { error: 'consent_required' }
        if (a.consent !== true) return { error: 'consent_required' }
        const name = asStr(a.name)
        const phone = asStr(a.phone)
        if (!name || !phone) return { error: 'missing_fields' }
        const doc = await payload.create({ collection: 'site-visit-requests', data: { name, phone, location: asStr(a.location), notes: `From AI Design Studio (project ${projectId ?? ''}).`, consent: { given: true, purpose: 'service_request', channel: 'ai_advisor', timestamp: new Date().toISOString() }, retention: { retainUntil: new Date(Date.now() + 2 * 365 * 24 * 3600 * 1000).toISOString(), legalBasis: 'consent' } } as never, overrideAccess: true })
        await trackDesignEvent(payload, 'site_visit_requested', { projectId: projectId ?? undefined })
        await notifyStaff(payload, 'Design Studio: site-visit request', [`Name: ${name}`, `Phone: ${phone}`])
        return { ok: true, reference: (doc as { reference?: string }).reference ?? `VIS-${(doc as { id: number }).id}` }
      }

      case 'assign_human_design_adviser': {
        return { ok: true, whatsapp: SITE.whatsappHref, phone: SITE.phone, message: 'A Hilty design adviser can continue with you on WhatsApp or by phone.' }
      }

      default:
        return { error: 'unknown_tool', tool: call.name }
    }
  }
}
