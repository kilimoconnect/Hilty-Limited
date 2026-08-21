import { GoogleGenAI } from '@google/genai'
import { isValidImageBytes } from './validate'
import { AiError, type ImageProvider, type ImageRequest, type ImageResult } from './types'

type Part = { inlineData?: { data?: string; mimeType?: string }; text?: string }
type GenResp = { candidates?: { content?: { parts?: Part[] } }[] }
type GenerateFn = (params: Record<string, unknown>) => Promise<GenResp>

/** Gemini image provider (generation + editing). Model is injected (configurable). */
export class GeminiImageProvider implements ImageProvider {
  readonly name = 'gemini' as const
  readonly model: string
  private ai: GoogleGenAI

  constructor(model: string, apiKey = process.env.GEMINI_API_KEY) {
    if (!apiKey) throw new AiError('outage', 'GEMINI_API_KEY is not configured')
    if (!model) throw new AiError('bad_request', 'GEMINI_IMAGE_MODEL is not configured')
    this.model = model
    this.ai = new GoogleGenAI({ apiKey })
  }

  async generate(req: ImageRequest, signal: AbortSignal): Promise<ImageResult> {
    const generate = this.ai.models.generateContent.bind(this.ai.models) as unknown as GenerateFn
    const parts: Part[] = [{ text: req.prompt }]
    if (req.mode === 'edit' && req.baseImage) parts.push({ inlineData: { mimeType: req.mimeType || 'image/png', data: req.baseImage.toString('base64') } })
    if (req.maskImage) parts.push({ inlineData: { mimeType: 'image/png', data: req.maskImage.toString('base64') } })

    const resp = await generate({
      model: this.model,
      contents: [{ role: 'user', parts }],
      config: { responseModalities: ['IMAGE'], abortSignal: signal },
    })

    const imgPart = resp.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)
    const b64 = imgPart?.inlineData?.data
    if (!b64) throw new AiError('invalid_schema', 'no image returned')
    const bytes = Buffer.from(b64, 'base64')
    if (!isValidImageBytes(bytes)) throw new AiError('invalid_schema', 'invalid image output')
    return { imageBytes: bytes, mimeType: imgPart?.inlineData?.mimeType || 'image/png', provider: 'gemini', model: this.model, usage: { imageCount: 1 } }
  }
}
