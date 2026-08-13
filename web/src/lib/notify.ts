import type { Payload } from 'payload'

/**
 * Notify staff of a new submission. Uses Payload's email transport
 * (Go SMTP in production; logs to console in local dev without an adapter).
 */
export async function notifyStaff(payload: Payload, subject: string, lines: string[]): Promise<boolean> {
  const to = process.env.STAFF_NOTIFY_EMAIL || 'info@hilty.co.tz'
  const text = lines.join('\n')
  try {
    await payload.sendEmail({ to, subject: `[Hilty] ${subject}`, text })
    payload.logger.info(`[notify] staff notified: ${subject}`)
    return true
  } catch (e) {
    payload.logger.error(`[notify] failed: ${e instanceof Error ? e.message : String(e)}`)
    return false
  }
}
