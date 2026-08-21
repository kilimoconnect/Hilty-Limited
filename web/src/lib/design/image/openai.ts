import OpenAI, { toFile } from 'openai'
import { isValidImageBytes } from './validate'
import { AiError, type ImageProvider, type ImageRequest, type ImageResult } from './types'

type ImagesApi = {
  generate: (p: Record<string, unknown>, o?: { signal?: AbortSignal }) => Promise<{ data?: { b64_json?: string }[]; usage?: { total_tokens?: number } }>
  edit: (p: Record<string, unknown>, o?: { signal?: AbortSignal }) => Promise<{ data?: { b64_json?: string }[]; usage?: { total_tokens?: number } }>
}

/** OpenAI image provider (generation + editing). Model is injected (configurable), never hard-coded. */
export class OpenAiImageProvider implements ImageProvider {
  readonly name = 'openai' as const
  readonly model: string
  private client: OpenAI

  constructor(model: string, apiKey = process.env.OPENAI_API_KEY) {
    if (!apiKey) throw new AiError('outage', 'OPENAI_API_KEY is not configured')
    if (!model) throw new AiError('bad_request', 'OPENAI_IMAGE_MODEL is not configured')
    this.model = model
    this.client = new OpenAI({ apiKey })
  }

  async generate(req: ImageRequest, signal: AbortSignal): Promise<ImageResult> {
    const images = this.client.images as unknown as ImagesApi
    const size = req.size || '1024x1024'
    let res: Awaited<ReturnType<ImagesApi['generate']>>

    if (req.mode === 'edit' && req.baseImage) {
      const image = await toFile(req.baseImage, 'base.png', { type: req.mimeType || 'image/png' })
      const params: Record<string, unknown> = { model: this.model, prompt: req.prompt, image, size }
      if (req.maskImage) params.mask = await toFile(req.maskImage, 'mask.png', { type: 'image/png' })
      res = await images.edit(params, { signal })
    } else {
      res = await images.generate({ model: this.model, prompt: req.prompt, size, n: 1 }, { signal })
    }

    const b64 = res.data?.[0]?.b64_json
    if (!b64) throw new AiError('invalid_schema', 'no image returned')
    const bytes = Buffer.from(b64, 'base64')
    if (!isValidImageBytes(bytes)) throw new AiError('invalid_schema', 'invalid image output')
    return { imageBytes: bytes, mimeType: 'image/png', provider: 'openai', model: this.model, usage: { imageCount: 1 } }
  }
}
