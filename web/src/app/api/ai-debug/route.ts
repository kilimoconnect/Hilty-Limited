import { NextResponse } from 'next/server'
import { OpenAiProvider } from '../../../lib/ai/openai'
import { createToolExecutor } from '../../../lib/ai/tools'

// TEMPORARY diagnostic — remove after. Gated by a token.
export async function GET(req: Request) {
  const url = new URL(req.url)
  if (url.searchParams.get('key') !== 'hiltydbg') return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const msg =
    url.searchParams.get('q') ||
    'Estimate paint for a 4 by 5 metre bedroom, 3 metres high, interior, include the ceiling, two coats.'
  const model = url.searchParams.get('model') || process.env.OPENAI_MODEL || 'gpt-4o'
  try {
    const provider = new OpenAiProvider(model)
    const executor = createToolExecutor({ consentGiven: false, locale: 'en' })
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 45_000)
    const res = await provider
      .generate({ messages: [{ role: 'user', content: msg }], locale: 'en' }, executor, ctrl.signal)
      .finally(() => clearTimeout(t))
    return NextResponse.json({ ok: true, model, message: res.response.customer_message.slice(0, 300) })
  } catch (e) {
    const err = e as { message?: string; name?: string; status?: number; stack?: string }
    return NextResponse.json({
      ok: false,
      model,
      name: err?.name,
      status: err?.status,
      message: String(err?.message || e),
      stack: String(err?.stack || '').slice(0, 1200),
    })
  }
}
