import type { Payload } from 'payload'
import { runImageFailover, type ImageFailoverOptions } from './image/service'
import type { ImageProvider } from './image/types'
import { addWatermark } from './watermark'
import { storePrivateImage } from './uploads'
import { buildEditPrompt, PROMPT_VERSION } from './prompt'
import { canRender, confirmedTypes } from './masking'
import { checkImageQuota, recordImageUse } from './quota'

export type VariantDeps = {
  payload: Payload
  primary: ImageProvider
  backup: ImageProvider | null
  opts: ImageFailoverOptions
  cfg: { maxGenerationsPerSession: number; dailyLimitPerIp: number }
}

export type VariantInput = {
  spaceId: number
  paletteId?: number
  baseImage: Buffer
  surfaces: { type: string; confirmedByUser?: boolean | null }[]
  paletteRoles: { role?: string | null; shadeName?: string | null }[]
  disclaimerAccepted: boolean
  conceptMode?: boolean
  sessionId: string
  clientId: string
  maskImage?: Buffer
}

export type VariantResult =
  | { ok: true; variantId: number; provider: 'openai' | 'gemini'; fallbackReason?: string; imageDataUrl: string }
  | { ok: false; error: string; humanAssistance?: boolean }

/**
 * Generate one visual variant: enforces disclaimer + confirmed masks + quota BEFORE any provider
 * call, edits only confirmed surfaces via the prompt, watermarks the result, stores it privately
 * and records a design-variant. If both providers fail, the project is preserved and human design
 * assistance is offered.
 */
export async function generateVariant(deps: VariantDeps, input: VariantInput): Promise<VariantResult> {
  if (!input.disclaimerAccepted) return { ok: false, error: 'disclaimer_required' }
  if (!canRender(input.surfaces)) return { ok: false, error: 'surfaces_not_confirmed' }

  const quota = checkImageQuota(input.sessionId, input.clientId, deps.cfg)
  if (!quota.allowed) return { ok: false, error: quota.reason || 'quota_exceeded' }

  const prompt = buildEditPrompt({ confirmedSurfaceTypes: confirmedTypes(input.surfaces), paletteRoles: input.paletteRoles, conceptMode: input.conceptMode })
  const fo = await runImageFailover(deps.primary, deps.backup, { mode: 'edit', prompt, baseImage: input.baseImage, maskImage: input.maskImage, mimeType: 'image/png' }, deps.opts)

  if (!fo.ok) {
    await deps.payload.create({
      collection: 'design-variants',
      data: { space: input.spaceId, palette: input.paletteId, status: 'failed', promptVersion: PROMPT_VERSION, disclaimerAccepted: true } as never,
      overrideAccess: true,
    })
    return { ok: false, error: 'generation_failed', humanAssistance: true }
  }

  recordImageUse(input.sessionId, input.clientId)
  const watermarked = await addWatermark(fo.result.imageBytes)
  const imageId = await storePrivateImage(deps.payload, watermarked, 'image/png', `variant-${Date.now()}.png`, 'design')
  const v = await deps.payload.create({
    collection: 'design-variants',
    data: {
      space: input.spaceId,
      palette: input.paletteId,
      image: imageId,
      provider: fo.result.provider,
      model: fo.result.model,
      status: 'succeeded',
      promptVersion: PROMPT_VERSION,
      selection: 'none',
      disclaimerAccepted: true,
    } as never,
    overrideAccess: true,
  })
  return {
    ok: true,
    variantId: (v as { id: number }).id,
    provider: fo.result.provider,
    fallbackReason: fo.fallbackReason,
    imageDataUrl: `data:image/png;base64,${watermarked.toString('base64')}`,
  }
}
