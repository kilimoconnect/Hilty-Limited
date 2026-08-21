import { AiError, FALLBACKABLE, type ImageFailoverResult, type ImageProvider, type ImageRequest, type ImageResult } from './types'

export type ImageFailoverOptions = { timeoutMs: number; maxRetries: number; sessionId?: string }

type ImageLog = {
  provider: 'openai' | 'gemini' | 'none'
  model: string
  latencyMs: number
  success: boolean
  fallbackReason?: string
  usage?: { cost?: number; imageCount?: number }
  sessionId?: string
}
export function logImageCall(entry: ImageLog): void {
  console.info('[design-image]', JSON.stringify(entry))
}

export function toAiError(e: unknown): AiError {
  if (e instanceof AiError) return e
  const err = e as { status?: number; code?: string; message?: string }
  const s = err?.status
  if (s === 429) return new AiError('rate_limit', err.message || 'rate limited', s)
  if (s && s >= 500) return new AiError('server', err.message || 'server error', s)
  if (s && s >= 400) return new AiError('bad_request', err.message || 'bad request', s)
  if (err?.code === 'ECONNREFUSED' || err?.code === 'ENOTFOUND' || err?.code === 'ETIMEDOUT') return new AiError('outage', err.message || 'network error')
  return new AiError('other', err?.message || 'unknown error')
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const backoff = (n: number) => 400 * 2 ** (n - 1) + Math.floor(Math.random() * 250)

function withTimeout<T>(fn: (signal: AbortSignal) => Promise<T>, ms: number): Promise<T> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  const timeout = new Promise<never>((_, reject) => {
    ctrl.signal.addEventListener('abort', () => reject(new AiError('timeout', `image timed out after ${ms}ms`)))
  })
  return Promise.race([fn(ctrl.signal), timeout]).finally(() => clearTimeout(timer)) as Promise<T>
}

async function callWithRetry(provider: ImageProvider, req: ImageRequest, opts: ImageFailoverOptions): Promise<ImageResult> {
  let attempt = 0
  for (;;) {
    try {
      return await withTimeout((signal) => provider.generate(req, signal), opts.timeoutMs)
    } catch (e) {
      const err = toAiError(e)
      if ((err.kind === 'rate_limit' || err.kind === 'server') && attempt < opts.maxRetries) {
        attempt++
        await sleep(backoff(attempt))
        continue
      }
      throw err
    }
  }
}

/**
 * Call the primary image provider; fall back to the backup ONLY for allowed reasons
 * (timeout, rate limit, outage, 5xx, invalid image output). Never both at once.
 * If both fail, preserve the project and offer human design assistance.
 */
export async function runImageFailover(
  primary: ImageProvider,
  backup: ImageProvider | null,
  req: ImageRequest,
  opts: ImageFailoverOptions,
): Promise<ImageFailoverResult> {
  const order = [primary, ...(backup ? [backup] : [])]
  let lastReason: string | undefined

  for (let i = 0; i < order.length; i++) {
    const provider = order[i]
    const start = Date.now()
    try {
      const result = await callWithRetry(provider, req, opts)
      logImageCall({ provider: provider.name, model: provider.model, latencyMs: Date.now() - start, success: true, usage: result.usage, sessionId: opts.sessionId, fallbackReason: i > 0 ? lastReason : undefined })
      return { ok: true, result, fallbackReason: i > 0 ? lastReason : undefined }
    } catch (e) {
      const err = toAiError(e)
      logImageCall({ provider: provider.name, model: provider.model, latencyMs: Date.now() - start, success: false, fallbackReason: err.kind, sessionId: opts.sessionId })
      lastReason = err.kind
      if (!FALLBACKABLE.includes(err.kind)) break
    }
  }

  logImageCall({ provider: 'none', model: '-', latencyMs: 0, success: false, fallbackReason: `human_assistance:${lastReason ?? 'unknown'}`, sessionId: opts.sessionId })
  return { ok: false, humanAssistance: true, reason: lastReason ?? 'unknown' }
}
