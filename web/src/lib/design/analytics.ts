import type { Payload } from 'payload'

/**
 * Design Studio analytics — METADATA ONLY. Never records private customer images, chat content,
 * names, phones or emails. Events are counts/attribution for management dashboards.
 */
export type DesignEventType =
  | 'studio_visit'
  | 'project_started'
  | 'image_uploaded'
  | 'palette_created'
  | 'visual_generated'
  | 'favourite_saved'
  | 'calculation_completed'
  | 'quotation_requested'
  | 'site_visit_requested'
  | 'whatsapp_handoff'
  | 'lead_won'
  | 'lead_lost'
  | 'revenue_recorded'
  | 'followup_scheduled'

export async function trackDesignEvent(
  payload: Payload,
  type: DesignEventType,
  opts: { projectId?: number; branchId?: number; leadRef?: string; value?: number; currency?: string; meta?: Record<string, string | number | boolean> } = {},
): Promise<void> {
  try {
    await payload.create({
      collection: 'design-events',
      data: {
        type,
        project: opts.projectId,
        branch: opts.branchId,
        leadRef: opts.leadRef,
        value: opts.value,
        currency: opts.currency,
        // meta must be non-PII (counts / flags only).
        meta: opts.meta ?? {},
      } as never,
      overrideAccess: true,
    })
  } catch (e) {
    payload.logger.error(`[design-analytics] failed: ${e instanceof Error ? e.message : String(e)}`)
  }
}
