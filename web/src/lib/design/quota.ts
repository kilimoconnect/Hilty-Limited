/**
 * Per-session and per-IP-per-day image-generation quotas. In-memory (per instance) — back with a
 * shared store in multi-instance/serverless production (same caveat as the AI rate limiter).
 */
const sessionCounts = new Map<string, number>()
const ipDaily = new Map<string, { date: string; count: number }>()
const today = () => new Date().toISOString().slice(0, 10)

export function checkImageQuota(
  sessionId: string,
  clientId: string,
  cfg: { maxGenerationsPerSession: number; dailyLimitPerIp: number },
): { allowed: boolean; reason?: string } {
  const s = sessionCounts.get(sessionId) ?? 0
  if (cfg.maxGenerationsPerSession > 0 && s >= cfg.maxGenerationsPerSession) return { allowed: false, reason: 'session_limit' }
  const d = ipDaily.get(clientId)
  const day = today()
  const count = d && d.date === day ? d.count : 0
  if (cfg.dailyLimitPerIp > 0 && count >= cfg.dailyLimitPerIp) return { allowed: false, reason: 'daily_ip_limit' }
  return { allowed: true }
}

export function recordImageUse(sessionId: string, clientId: string): void {
  sessionCounts.set(sessionId, (sessionCounts.get(sessionId) ?? 0) + 1)
  const day = today()
  const d = ipDaily.get(clientId)
  ipDaily.set(clientId, d && d.date === day ? { date: day, count: d.count + 1 } : { date: day, count: 1 })
}

export function _resetImageQuota(): void {
  sessionCounts.clear()
  ipDaily.clear()
}
