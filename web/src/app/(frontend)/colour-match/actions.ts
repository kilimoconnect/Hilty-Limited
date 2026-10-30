'use server'

import { headers } from 'next/headers'
import { createHash } from 'crypto'
import { runAdvisor } from '../../../lib/ai/advisor'
import type { AdvisorLanguage } from '../../../lib/ai/types'

async function clientId(): Promise<string> {
  const h = await headers()
  const ip = (h.get('x-forwarded-for') || '').split(',')[0].trim() || h.get('x-real-ip') || 'anonymous'
  return createHash('sha256').update(ip).digest('hex').slice(0, 24)
}

/** AI guidance for a palette extracted client-side from a photo. Never invents Plascon codes. */
export async function colourGuidanceAction(input: {
  hexes: string[]
  locale: AdvisorLanguage
}): Promise<{ guidance: string }> {
  const hexes = (input.hexes || []).filter((h) => /^#[0-9a-fA-F]{6}$/.test(h)).slice(0, 6)
  if (!hexes.length) return { guidance: '' }

  const seeded =
    `The customer extracted this colour palette from an inspiration photo: ${hexes.join(', ')}. ` +
    'Advise how to use these colours in a room: which could serve as the main walls, an accent wall, and trim/ceiling, and a suitable finish for each. ' +
    'Explain that Hilty matches colours to Plascon shades using a physical fan deck or a brushed-out sample. ' +
    'Do NOT invent specific Plascon shade names or codes; recommend confirming the exact shade with a physical sample. ' +
    'Keep it concise and professional. Do not create a lead or quotation.'

  const outcome = await runAdvisor({
    messages: [{ role: 'user', content: seeded }],
    locale: input.locale,
    consentGiven: false,
    clientId: await clientId(),
  })
  return { guidance: outcome.response.customer_message }
}
