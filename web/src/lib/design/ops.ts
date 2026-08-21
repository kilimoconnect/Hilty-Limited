import type { Payload } from 'payload'

/**
 * Send a converted design lead into the Hilty Operations application. If HILTY_OPS_WEBHOOK_URL is
 * configured, POST the lead payload there; otherwise record locally (delivered:false). Failures
 * never break the customer conversion. This carries operational lead data (contact + calc summary)
 * to Hilty's own internal system — it is NOT the general analytics path.
 */
export type OpsPayload = {
  reference: string
  projectId: number
  branchId?: number
  contact: { name: string; phone: string; email?: string; location?: string }
  calcSummary: string
  budget?: string
  timeline?: string
}

export async function sendToOperations(payload: Payload, data: OpsPayload): Promise<{ delivered: boolean }> {
  const url = process.env.HILTY_OPS_WEBHOOK_URL
  if (!url) {
    payload.logger.info(`[ops] no HILTY_OPS_WEBHOOK_URL — recorded locally for ${data.reference}`)
    return { delivered: false }
  }
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10_000)
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(process.env.HILTY_OPS_API_KEY ? { authorization: `Bearer ${process.env.HILTY_OPS_API_KEY}` } : {}) },
      body: JSON.stringify({ source: 'ai_design_studio', ...data }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timer))
    return { delivered: res.ok }
  } catch (e) {
    payload.logger.error(`[ops] delivery failed for ${data.reference}: ${e instanceof Error ? e.message : String(e)}`)
    return { delivered: false }
  }
}
