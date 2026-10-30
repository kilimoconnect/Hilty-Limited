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
    `Draft a professional painting estimate for this project: "${desc}". ` +
    'If room sizes are given, call calculate_paint_requirements ONCE and state the estimated area (m²). State litres only if the tool returns a number; if coverage is unknown, say the litres depend on the chosen product’s coverage — never write a placeholder like "X litres". ' +
    'Fill recommended_system_steps in order (surface preparation, primer/undercoat, topcoat and number of coats). ' +
    'Only include recommended_products if the catalogue returns a match — do not search more than once. ' +
    'List anything still needed to finalise pricing in missing_information. ' +
    'Do not create any lead, quotation or appointment. Keep customer_message concise and note that Hilty confirms final pricing and stock.'

  await trackSiteEvent('ai_conversation_started')
  const outcome = await runAdvisor({
    messages: [{ role: 'user', content: seeded }],
    locale: input.locale,
    consentGiven: false,
    clientId: await clientId(),
  })
  return outcome.response
}
