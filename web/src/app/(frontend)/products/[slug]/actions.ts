'use server'

import { headers } from 'next/headers'
import { createHash } from 'crypto'
import { runAdvisor } from '../../../../lib/ai/advisor'
import type { AdvisorLanguage } from '../../../../lib/ai/types'

async function clientId(): Promise<string> {
  const h = await headers()
  const ip = (h.get('x-forwarded-for') || '').split(',')[0].trim() || h.get('x-real-ip') || 'anonymous'
  return createHash('sha256').update(ip).digest('hex').slice(0, 24)
}

/**
 * Product-scoped question. Seeds the product context so the advisor looks the
 * product up via get_product_details and answers only about this item. Returns
 * just the written answer — no lead capture on a product Q&A.
 */
export async function askProductAction(input: {
  productId: number
  productName: string
  question: string
  locale: AdvisorLanguage
}): Promise<{ answer: string; needsHuman: boolean }> {
  const q = input.question.trim().slice(0, 500)
  if (!q) return { answer: '', needsHuman: false }

  const seeded =
    `The customer is viewing the Hilty catalogue product "${input.productName}" (product_id ${input.productId}). ` +
    `Call get_product_details for product_id ${input.productId} first, then answer ONLY about this product and closely related guidance. ` +
    `If the question is unrelated to this product or to paint, briefly steer back. Question: ${q}`

  const outcome = await runAdvisor({
    messages: [{ role: 'user', content: seeded }],
    locale: input.locale,
    consentGiven: false,
    clientId: await clientId(),
  })

  return { answer: outcome.response.customer_message, needsHuman: outcome.response.needs_human === true }
}
