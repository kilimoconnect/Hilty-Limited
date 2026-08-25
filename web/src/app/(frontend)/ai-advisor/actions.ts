'use server'

import { headers } from 'next/headers'
import { createHash } from 'crypto'
import { runAdvisor } from '../../../lib/ai/advisor'
import type { AdvisorLanguage, AdvisorResponse, ChatMessage } from '../../../lib/ai/types'

async function clientId(): Promise<string> {
  const h = await headers()
  const ip = (h.get('x-forwarded-for') || '').split(',')[0].trim() || h.get('x-real-ip') || 'anonymous'
  return createHash('sha256').update(ip).digest('hex').slice(0, 24) // hashed — never store raw IP
}

export async function advisorChatAction(input: {
  messages: ChatMessage[]
  locale: AdvisorLanguage
  consent: boolean
  sessionId?: string
}): Promise<AdvisorResponse> {
  const outcome = await runAdvisor({
    messages: input.messages.slice(-12), // keep recent turns; input-length is also enforced server-side
    locale: input.locale,
    consentGiven: input.consent,
    clientId: await clientId(),
    sessionId: input.sessionId,
  })
  return outcome.response
}
