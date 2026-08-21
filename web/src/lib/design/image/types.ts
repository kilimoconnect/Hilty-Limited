import { AiError, type AiErrorKind, FALLBACKABLE } from '../../ai/types'

export { AiError, FALLBACKABLE }
export type { AiErrorKind }

export type ImageMode = 'generate' | 'edit'

export type ImageRequest = {
  mode: ImageMode
  prompt: string
  size?: string
  /** Base photo (for edit mode). */
  baseImage?: Buffer
  /** Mask marking the editable region (for edit mode). */
  maskImage?: Buffer
  mimeType?: string
}

export type ImageUsage = { cost?: number; imageCount?: number }

export type ImageResult = {
  imageBytes: Buffer
  mimeType: string
  provider: 'openai' | 'gemini'
  model: string
  usage?: ImageUsage
}

/** Common server-side image provider. Throw AiError with the correct kind on failure. */
export interface ImageProvider {
  readonly name: 'openai' | 'gemini'
  readonly model: string
  generate(req: ImageRequest, signal: AbortSignal): Promise<ImageResult>
}

export type ImageFailoverResult =
  | { ok: true; result: ImageResult; fallbackReason?: string }
  | { ok: false; humanAssistance: true; reason: string }
