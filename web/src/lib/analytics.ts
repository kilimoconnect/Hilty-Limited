import type { Payload } from 'payload'
import { getClient } from './payload'

export type SiteEventType =
  | 'product_viewed'
  | 'calculator_started'
  | 'calculator_completed'
  | 'quote_requested'
  | 'site_visit_requested'
  | 'boq_uploaded'
  | 'whatsapp_clicked'
  | 'branch_selected'
  | 'ai_conversation_started'
  | 'ai_converted_to_lead'
  | 'painter_registration'

/** Record a website analytics event. METADATA ONLY — never chat/PII/images. Best-effort (never throws). */
export async function trackSiteEvent(
  type: SiteEventType,
  opts: { ref?: string; meta?: Record<string, string | number | boolean>; payload?: Payload } = {},
): Promise<void> {
  try {
    const payload = opts.payload ?? (await getClient())
    await payload.create({ collection: 'analytics-events', data: { type, ref: opts.ref, meta: opts.meta ?? {} } as never, overrideAccess: true })
  } catch {
    // analytics must never break the request
  }
}
