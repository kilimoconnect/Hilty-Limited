import { readFile } from 'fs/promises'
import path from 'path'
import { getClient } from '../payload'
import { calculate, type RoomInput } from '../calc'
import { notifyStaff } from '../notify'
import { validateAndProcessImage, storePrivateImage } from './uploads'
import { proposeInitialSurfaces } from './masking'
import { generatePalettes } from './palettes'
import { generateVariant, type VariantResult } from './variant'
import { getImageConfig } from './image/config'
import { OpenAiImageProvider } from './image/openai'
import { GeminiImageProvider } from './image/gemini'
import type { ImageProvider } from './image/types'
import { deleteProject } from './lifecycle'

const idOf = (v: unknown): number | undefined => (typeof v === 'number' ? v : v && typeof v === 'object' && 'id' in v ? (v as { id: number }).id : undefined)
const RETENTION_MS = (days: number) => days * 24 * 60 * 60 * 1000

// ---------- Project ----------
export async function createDesignProject(input: { name: string; mode?: string; type?: string; sector?: 'residential' | 'commercial'; newOrRepaint?: string; location?: string; language?: 'en' | 'sw'; customerRef?: string }) {
  const payload = await getClient()
  const cfg = getImageConfig()
  const doc = await payload.create({
    collection: 'design-projects',
    data: {
      name: input.name || 'My design project',
      sector: input.sector,
      location: input.location,
      language: input.language ?? 'en',
      customerRef: input.customerRef,
      status: 'draft',
      retention: { retainUntil: new Date(Date.now() + RETENTION_MS(cfg.retentionDays)).toISOString(), legalBasis: 'consent' },
    } as never,
    overrideAccess: true,
  })
  return { projectId: (doc as { id: number }).id, reference: (doc as { reference?: string }).reference }
}

// ---------- Space image ----------
export async function attachSpaceImage(input: { projectId: number; buffer: Buffer; filename: string; declaredMime?: string; name?: string; surfaceType?: string; interiorExterior?: 'interior' | 'exterior'; ownershipConfirmed: boolean }) {
  if (!input.ownershipConfirmed) return { ok: false as const, error: 'ownership_required' }
  const payload = await getClient()
  const cfg = getImageConfig()
  let processed
  try {
    processed = await validateAndProcessImage({ buffer: input.buffer, filename: input.filename, declaredMime: input.declaredMime, maxMB: cfg.maxUploadMb })
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : 'invalid_image' }
  }
  const originalId = await storePrivateImage(payload, input.buffer, input.declaredMime || processed.mime, `orig-${input.filename}`, 'design')
  const processedId = await storePrivateImage(payload, processed.buffer, processed.mime, `proc-${input.filename}`, 'design')
  const space = await payload.create({
    collection: 'design-spaces',
    data: {
      project: input.projectId,
      name: input.name || 'Space 1',
      surfaceType: input.surfaceType,
      interiorExterior: input.interiorExterior,
      originalImage: originalId,
      processedImage: processedId,
      imageWidth: processed.width,
      imageHeight: processed.height,
      ownershipConfirmed: true,
      privacyStatus: 'private',
    } as never,
    overrideAccess: true,
  })
  const suggestions = proposeInitialSurfaces({ surfaceType: input.surfaceType, interiorExterior: input.interiorExterior })
  return { ok: true as const, spaceId: (space as { id: number }).id, width: processed.width, height: processed.height, suggestions }
}

// ---------- Surfaces ----------
export async function saveSpaceSurfaces(spaceId: number, surfaces: { id?: number; type: string; mask?: unknown; confirmedByUser: boolean; areaM2?: number }[]) {
  const payload = await getClient()
  const saved: number[] = []
  for (const s of surfaces) {
    if (s.id) {
      const existing = await payload.findByID({ collection: 'design-surfaces', id: s.id, overrideAccess: true }).catch(() => null)
      const nextVersion = (existing?.maskVersion ?? 0) + 1
      const d = await payload.update({ collection: 'design-surfaces', id: s.id, data: { type: s.type, mask: s.mask, confirmedByUser: s.confirmedByUser, areaM2: s.areaM2, maskVersion: nextVersion } as never, overrideAccess: true })
      saved.push((d as { id: number }).id)
    } else {
      const d = await payload.create({ collection: 'design-surfaces', data: { space: spaceId, type: s.type, mask: s.mask, confirmedByUser: s.confirmedByUser, areaM2: s.areaM2, maskVersion: 1 } as never, overrideAccess: true })
      saved.push((d as { id: number }).id)
    }
  }
  return { ok: true as const, surfaceIds: saved }
}

// ---------- Preferences ----------
export async function savePreferences(projectId: number, prefs: Record<string, unknown>) {
  const payload = await getClient()
  const existing = await payload.find({ collection: 'design-preferences', where: { project: { equals: projectId } }, limit: 1, overrideAccess: true })
  const data = { project: projectId, ...prefs } as never
  if (existing.docs[0]) {
    await payload.update({ collection: 'design-preferences', id: existing.docs[0].id, data, overrideAccess: true })
    return { ok: true as const, id: existing.docs[0].id }
  }
  const d = await payload.create({ collection: 'design-preferences', data, overrideAccess: true })
  return { ok: true as const, id: (d as { id: number }).id }
}

// ---------- Palettes ----------
export async function makePalettes(projectId: number, opts: { temperature?: string; interiorExterior?: string; preferredFinish?: string }) {
  const payload = await getClient()
  const generated = await generatePalettes(opts)
  const ids: number[] = []
  for (const g of generated) {
    const d = await payload.create({
      collection: 'design-palettes',
      data: {
        project: projectId,
        name: g.title,
        aiExplanation: g.explanation,
        roles: g.roles.map((r) => ({ role: r.role, shadeName: r.name, hexApprox: r.hex, product: r.productId ?? undefined, finish: r.finish ?? undefined })),
        status: 'proposed',
      } as never,
      overrideAccess: true,
    })
    ids.push((d as { id: number }).id)
  }
  return { ok: true as const, palettes: generated.map((g, i) => ({ ...g, id: ids[i] })) }
}

// ---------- Providers ----------
function buildImageProviders(): { primary: ImageProvider | null; backup: ImageProvider | null } {
  const cfg = getImageConfig()
  const build = (name: 'openai' | 'gemini') => {
    try {
      return name === 'openai' ? new OpenAiImageProvider(cfg.openaiModel) : new GeminiImageProvider(cfg.geminiModel)
    } catch {
      return null
    }
  }
  const primaryName = cfg.primary
  const backupName = primaryName === 'openai' ? 'gemini' : 'openai'
  return { primary: build(primaryName), backup: build(backupName) }
}

async function readFromS3(filename: string): Promise<Buffer | null> {
  if (!process.env.S3_BUCKET || !process.env.S3_ACCESS_KEY_ID) return null
  try {
    const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3')
    const client = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION || 'us-east-1',
      forcePathStyle: true,
      credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '' },
    })
    const res = await client.send(new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: filename }))
    const body = res.Body as { transformToByteArray?: () => Promise<Uint8Array> } | undefined
    if (!body?.transformToByteArray) return null
    return Buffer.from(await body.transformToByteArray())
  } catch {
    return null
  }
}

async function readDocumentBytes(payload: Awaited<ReturnType<typeof getClient>>, id?: number): Promise<Buffer | null> {
  if (!id) return null
  const doc = await payload.findByID({ collection: 'documents', id, overrideAccess: true }).catch(() => null)
  const filename = (doc as { filename?: string } | null)?.filename
  if (!filename) return null
  // Object storage (Supabase/S3) in production; local disk in dev.
  const fromS3 = await readFromS3(filename)
  if (fromS3) return fromS3
  try {
    return await readFile(path.join(process.cwd(), 'private-uploads', filename))
  } catch {
    return null
  }
}

// ---------- Variant ----------
export async function makeVariant(input: { spaceId: number; paletteId?: number; surfaces: { type: string; confirmedByUser?: boolean | null }[]; disclaimerAccepted: boolean; sessionId: string; clientId: string; conceptMode?: boolean; providers?: { primary: ImageProvider | null; backup: ImageProvider | null } }): Promise<VariantResult> {
  const payload = await getClient()
  const cfg = getImageConfig()
  const providers = input.providers ?? buildImageProviders()
  if (!providers.primary) return { ok: false, error: 'image_service_unavailable', humanAssistance: true }

  const space = await payload.findByID({ collection: 'design-spaces', id: input.spaceId, overrideAccess: true }).catch(() => null)
  const base = await readDocumentBytes(payload, idOf(space?.processedImage))
  if (!base) return { ok: false, error: 'no_base_image', humanAssistance: true }

  let paletteRoles: { role?: string | null; shadeName?: string | null }[] = []
  if (input.paletteId) {
    const pal = await payload.findByID({ collection: 'design-palettes', id: input.paletteId, overrideAccess: true }).catch(() => null)
    paletteRoles = ((pal?.roles ?? []) as { role?: string; shadeName?: string }[]).map((r) => ({ role: r.role, shadeName: r.shadeName }))
  }
  return generateVariant(
    { payload, primary: providers.primary, backup: providers.backup, opts: { timeoutMs: cfg.timeoutMs, maxRetries: cfg.maxRetries }, cfg: { maxGenerationsPerSession: cfg.maxGenerationsPerSession, dailyLimitPerIp: cfg.dailyLimitPerIp } },
    { spaceId: input.spaceId, paletteId: input.paletteId, baseImage: base, surfaces: input.surfaces, paletteRoles, disclaimerAccepted: input.disclaimerAccepted, conceptMode: input.conceptMode, sessionId: input.sessionId, clientId: input.clientId },
  )
}

// ---------- Convert to plan (deterministic calculator; NEVER from a photo) ----------
export async function convertToPlan(input: { projectId: number; spaceId?: number; paletteId?: number; rooms: RoomInput[]; coats?: number; wastePct?: number }) {
  const payload = await getClient()
  let topcoatId: number | undefined
  let finish: string | undefined
  if (input.paletteId) {
    const pal = await payload.findByID({ collection: 'design-palettes', id: input.paletteId, overrideAccess: true }).catch(() => null)
    const main = ((pal?.roles ?? []) as { role?: string; product?: unknown; finish?: string }[]).find((r) => r.role === 'main')
    topcoatId = idOf(main?.product)
    finish = main?.finish
  }
  let coverage: number | null = null
  let productName: string | null = null
  let packSizes: number[] = []
  if (topcoatId) {
    const product = await payload.findByID({ collection: 'products', id: topcoatId, depth: 0, overrideAccess: true }).catch(() => null)
    const cov = typeof product?.coveragePerLitre === 'number' ? product.coveragePerLitre : 0
    coverage = product?.verification?.status === 'verified' && cov > 0 ? cov : null
    productName = product?.name ?? null
    packSizes = (product?.packSizes ?? []).map((x) => x.litres).filter((n): n is number => typeof n === 'number' && n > 0)
  }
  const calc = calculate(input.rooms, [{ key: 'topcoat', label: 'Topcoat', coats: input.coats ?? 2, coverage, productName: productName ?? undefined, packSizes, appliesTo: 'both' }], { wastePct: input.wastePct ?? 10 })
  const plan = await payload.create({
    collection: 'design-product-plan',
    data: { project: input.projectId, surface: undefined, product: topcoatId, topcoat: topcoatId, finish, verifiedCoverage: coverage ?? undefined, coats: input.coats ?? 2, calculatorReference: `DSCALC-${Date.now()}` } as never,
    overrideAccess: true,
  })
  await payload.update({ collection: 'design-projects', id: input.projectId, data: { status: 'measured' } as never, overrideAccess: true })
  return { ok: true as const, calc, planId: (plan as { id: number }).id }
}

// ---------- Quote-ready lead (consent required) ----------
export async function saveDesignLead(input: { projectId: number; name: string; phone: string; email?: string; location?: string; branchId?: number; budget?: string; timeline?: string; siteVisitPreference?: string; consent: boolean }) {
  if (!input.consent) return { ok: false as const, error: 'consent_required' }
  if (!input.name?.trim() || !input.phone?.trim()) return { ok: false as const, error: 'missing_fields' }
  const payload = await getClient()
  const project = await payload.findByID({ collection: 'design-projects', id: input.projectId, overrideAccess: true }).catch(() => null)
  const ref = (project as { reference?: string } | null)?.reference

  const summary = [
    `Design project ${ref ?? input.projectId}`,
    input.location ? `Location: ${input.location}` : '',
    input.budget ? `Budget: ${input.budget}` : '',
    input.timeline ? `Timeline: ${input.timeline}` : '',
    input.siteVisitPreference ? `Site visit: ${input.siteVisitPreference}` : '',
    'Auto-generated summary from the Design Studio (estimates require site verification).',
  ].filter(Boolean).join('\n')

  const consent = { given: true, purpose: 'service_request', channel: 'ai_advisor', timestamp: new Date().toISOString() }
  await payload.update({ collection: 'design-projects', id: input.projectId, data: { consent, branch: input.branchId, location: input.location, quotationStatus: 'requested', status: 'converted' } as never, overrideAccess: true })
  await payload.create({
    collection: 'leads',
    data: { name: input.name, phone: input.phone, email: input.email, source: 'ai_advisor', interest: 'Design Studio', message: summary, branch: input.branchId, consent, retention: { retainUntil: new Date(Date.now() + RETENTION_MS(730)).toISOString(), legalBasis: 'consent' } } as never,
    overrideAccess: true,
  })
  await notifyStaff(payload, `New Design Studio lead ${ref ?? ''}`, [`Name: ${input.name}`, `Phone: ${input.phone}`, summary])
  return { ok: true as const, reference: ref ?? String(input.projectId) }
}

// ---------- Load / delete ----------
export async function loadProjectState(projectId: number) {
  const payload = await getClient()
  const project = await payload.findByID({ collection: 'design-projects', id: projectId, overrideAccess: true }).catch(() => null)
  if (!project) return { ok: false as const, error: 'not_found' }
  const spaces = await payload.find({ collection: 'design-spaces', where: { project: { equals: projectId } }, limit: 20, overrideAccess: true })
  const palettes = await payload.find({ collection: 'design-palettes', where: { project: { equals: projectId } }, limit: 20, overrideAccess: true })
  return { ok: true as const, project, spaces: spaces.docs, palettes: palettes.docs }
}

export async function removeDesignProject(projectId: number) {
  const payload = await getClient()
  return deleteProject(payload, projectId)
}
