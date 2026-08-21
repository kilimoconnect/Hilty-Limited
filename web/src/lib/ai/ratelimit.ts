/**
 * Simple in-memory sliding-window rate limiter keyed by client id (IP hash).
 * NOTE: per-instance only. In a multi-instance/serverless deployment, back this with a
 * shared store (e.g. Redis / Upstash) — flagged for production.
 */
const WINDOW_MS = 60_000
const hits = new Map<string, number[]>()

export function checkRateLimit(clientId: string, limitPerMinute: number): { allowed: boolean; remaining: number } {
  if (limitPerMinute <= 0) return { allowed: true, remaining: Infinity }
  const now = Date.now()
  const arr = (hits.get(clientId) ?? []).filter((t) => now - t < WINDOW_MS)
  if (arr.length >= limitPerMinute) {
    hits.set(clientId, arr)
    return { allowed: false, remaining: 0 }
  }
  arr.push(now)
  hits.set(clientId, arr)
  return { allowed: true, remaining: Math.max(0, limitPerMinute - arr.length) }
}

/** Test/maintenance helper. */
export function _resetRateLimit(): void {
  hits.clear()
}
