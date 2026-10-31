import { NextResponse } from 'next/server'
import { OpenAiImageProvider } from '../../../lib/design/image/openai'
import { GeminiImageProvider } from '../../../lib/design/image/gemini'
import { getImageConfig } from '../../../lib/design/image/config'

export const maxDuration = 60

// TEMPORARY diagnostic — remove after.
export async function GET(req: Request) {
  const url = new URL(req.url)
  if (url.searchParams.get('key') !== 'hiltydbg') return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const cfg = getImageConfig()
  const out: Record<string, unknown> = { openaiModel: cfg.openaiModel, geminiModel: cfg.geminiModel, primary: cfg.primary }
  const prompt = 'A plain interior wall painted soft sage green, photorealistic, simple.'

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 50_000)
  try {
    try {
      const p = new OpenAiImageProvider(cfg.openaiModel)
      const r = await p.generate({ prompt, mode: 'generate', size: '1024x1024' } as never, ctrl.signal)
      out.openai = { ok: true, bytes: r.imageBytes.length }
    } catch (e) {
      out.openai = { ok: false, error: String((e as Error)?.message || e).slice(0, 220) }
    }
    try {
      const g = new GeminiImageProvider(cfg.geminiModel)
      const r = await g.generate({ prompt, mode: 'generate', size: '1024x1024' } as never, ctrl.signal)
      out.gemini = { ok: true, bytes: r.imageBytes.length }
    } catch (e) {
      out.gemini = { ok: false, error: String((e as Error)?.message || e).slice(0, 220) }
    }
  } finally {
    clearTimeout(timer)
  }
  return NextResponse.json(out)
}
