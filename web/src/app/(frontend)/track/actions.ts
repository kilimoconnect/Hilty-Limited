'use server'

import { trackSiteEvent, type SiteEventType } from '../../../lib/analytics'

const ALLOWED: SiteEventType[] = ['product_viewed', 'calculator_started', 'calculator_completed', 'whatsapp_clicked', 'branch_selected']

/** Public client-fired analytics beacon. Metadata only — never chat/PII. */
export async function trackEventAction(type: string, ref?: string): Promise<void> {
  if (!ALLOWED.includes(type as SiteEventType)) return
  await trackSiteEvent(type as SiteEventType, { ref: ref?.slice(0, 80) })
}
