'use server'

import { headers } from 'next/headers'
import { createHash } from 'crypto'
import { runAdvisor } from '../../../lib/ai/advisor'
import { trackSiteEvent } from '../../../lib/analytics'
import type { AdvisorLanguage, AdvisorResponse } from '../../../lib/ai/types'

async function clientId(): Promise<string> {
  const h = await headers()
  const ip = (h.get('x-forwarded-for') || '').split(',')[0].trim() || h.get('x-real-ip') || 'anonymous'
  return createHash('sha256').update(ip).digest('hex').slice(0, 24)
}

/**
 * Produce a draft painting estimate from a free-text project description. Reuses the
 * advisor (catalogue tools + deterministic calculator). Never creates a lead/quote.
 */
export async function quoteDraftAction(input: {
  description: string
  locale: AdvisorLanguage
}): Promise<AdvisorResponse> {
  const desc = input.description.trim().slice(0, 1500)

  const seeded =
    `The customer wants a DRAFT painting estimate. Project description: "${desc}". ` +
    'Produce an itemised recommendation: fill recommended_system_steps in order (surface preparation, primer/undercoat, topcoat and number of coats); ' +
    'recommend suitable catalogue products in recommended_products, each with a short "why"; ' +
    'if room measurements are provided, call calculate_paint_requirements and summarise the estimated litres per component in customer_message. ' +
    'Put anything still required to finalise pricing in missing_information. ' +
    'Do NOT create a lead, quotation, appointment or sample request — this is a draft only. ' +
    'Keep customer_message a concise, professional estimate summary and state that Hilty confirms final pricing and stock.'

  await trackSiteEvent('ai_conversation_started')
  const outcome = await runAdvisor({
    messages: [{ role: 'user', content: seeded }],
    locale: input.locale,
    consentGiven: false,
    clientId: await clientId(),
  })
  return outcome.response
}
