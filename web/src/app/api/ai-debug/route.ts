import { NextResponse } from 'next/server'
import { runAdvisor } from '../../../lib/ai/advisor'

// TEMPORARY diagnostic — remove after. Gated by a token.
export async function GET(req: Request) {
  const url = new URL(req.url)
  if (url.searchParams.get('key') !== 'hiltydbg') return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const msg =
    url.searchParams.get('q') ||
    'Estimate paint for a 4 by 5 metre bedroom, 3 metres high, interior, include the ceiling, two coats.'
  try {
    const outcome = await runAdvisor({
      messages: [{ role: 'user', content: msg }],
      locale: 'en',
      consentGiven: false,
      clientId: 'debug',
    })
    return NextResponse.json({
      provider_used: outcome.response.provider_used,
      fallbackReason: outcome.fallbackReason ?? null,
      blocked: outcome.blocked ?? null,
      detected_intent: outcome.response.detected_intent,
      message: outcome.response.customer_message.slice(0, 300),
    })
  } catch (e) {
    return NextResponse.json({ threw: String((e as Error)?.message || e) })
  }
}
