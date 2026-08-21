import { logAiCall } from './log'
import {
  AiError,
  FALLBACKABLE,
  type AdvisorRequest,
  type AdvisorResponse,
  type AiProvider,
  type ProviderResult,
  type ToolExecutor,
} from './types'

export type FailoverOptions = { timeoutMs: number; maxRetries: number; sessionId?: string }

/** Safe deterministic response when AI is unavailable — offers calculator, quote and human handoff. */
export function safeFallbackResponse(locale: 'en' | 'sw'): AdvisorResponse {
  const en =
    'I can’t reach the paint advisor right now. You can still use our paint calculator, request a quotation, or chat with our team on WhatsApp or by phone.'
  const sw =
    'Siwezi kufikia mshauri wa rangi kwa sasa. Bado unaweza kutumia kikokotoo cha rangi, kuomba nukuu, au kuzungumza na timu yetu kupitia WhatsApp au simu.'
  return {
    customer_message: locale === 'sw' ? sw : en,
    language: locale,
    detected_intent: 'service_unavailable',
    project_summary: '',
    recommended_products: [],
    recommended_system_steps: [],
    missing_information: [],
    calculator_result_reference: null,
    lead_readiness: 'not_ready',
    suggested_next_action: 'whatsapp',
    needs_human: true,
    safety_or_uncertainty_note:
      locale === 'sw'
        ? 'Huduma ya AI haipatikani kwa muda. Chaguzi za kawaida zinapatikana.'
        : 'The AI service is temporarily unavailable. The standard options are available.',
    provider_used: 'none',
  }
}

export function toAiError(e: unknown): AiError {
  if (e instanceof AiError) return e
  const err = e as { status?: number; code?: string; message?: string }
  const status = err?.status
  if (status === 429) return new AiError('rate_limit', err.message || 'rate limited', status)
  if (status && status >= 500) return new AiError('server', err.message || 'server error', status)
  if (status && status >= 400) return new AiError('bad_request', err.message || 'bad request', status)
  if (err?.code === 'ECONNREFUSED' || err?.code === 'ENOTFOUND' || err?.code === 'ETIMEDOUT') return new AiError('outage', err.message || 'network error')
  return new AiError('other', err?.message || 'unknown error')
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const backoff = (attempt: number) => 300 * 2 ** (attempt - 1) + Math.floor(Math.random() * 200)

function withTimeout<T>(fn: (signal: AbortSignal) => Promise<T>, ms: number): Promise<T> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  const timeout = new Promise<never>((_, reject) => {
    ctrl.signal.addEventListener('abort', () => reject(new AiError('timeout', `timed out after ${ms}ms`)))
  })
  return Promise.race([fn(ctrl.signal), timeout]).finally(() => clearTimeout(timer)) as Promise<T>
}

const REPAIR_HINT =
  'Your previous response did not match the required JSON schema. Return ONLY a valid object that exactly matches the advisor_response schema.'

async function callWithRetry(provider: AiProvider, req: AdvisorRequest, executor: ToolExecutor, opts: FailoverOptions): Promise<ProviderResult> {
  let attempt = 0
  let repaired = false
  while (true) {
    try {
      return await withTimeout((signal) => provider.generate(req, executor, signal, repaired ? REPAIR_HINT : undefined), opts.timeoutMs)
    } catch (e) {
      const err = toAiError(e)
      if ((err.kind === 'rate_limit' || err.kind === 'server') && attempt < opts.maxRetries) {
        attempt++
        await sleep(backoff(attempt))
        continue
      }
      // One controlled repair attempt for an invalid structured response, then fall back.
      if (err.kind === 'invalid_schema' && !repaired) {
        repaired = true
        continue
      }
      throw err
    }
  }
}

/**
 * Call the primary provider; fall back to the backup ONLY for allowed reasons. Never call both
 * simultaneously. If both fail (or the failure is non-fallbackable), return a safe deterministic response.
 */
export async function runFailover(
  primary: AiProvider,
  backup: AiProvider | null,
  req: AdvisorRequest,
  executor: ToolExecutor,
  opts: FailoverOptions,
): Promise<{ response: AdvisorResponse; fallbackReason?: string }> {
  const order = [primary, ...(backup ? [backup] : [])]
  let lastReason: string | undefined

  for (let i = 0; i < order.length; i++) {
    const provider = order[i]
    const start = Date.now()
    try {
      const { response, usage } = await callWithRetry(provider, req, executor, opts)
      logAiCall({ provider: provider.name, model: provider.model, latencyMs: Date.now() - start, success: true, usage, sessionId: opts.sessionId, fallbackReason: i > 0 ? lastReason : undefined })
      return { response: { ...response, provider_used: provider.name }, fallbackReason: i > 0 ? lastReason : undefined }
    } catch (e) {
      const err = toAiError(e)
      logAiCall({ provider: provider.name, model: provider.model, latencyMs: Date.now() - start, success: false, fallbackReason: err.kind, sessionId: opts.sessionId })
      lastReason = err.kind
      if (!FALLBACKABLE.includes(err.kind)) break // non-fallbackable → safe response, do NOT try backup
    }
  }

  logAiCall({ provider: 'none', model: '-', latencyMs: 0, success: false, fallbackReason: `safe_fallback:${lastReason ?? 'unknown'}`, sessionId: opts.sessionId })
  return { response: safeFallbackResponse(req.locale), fallbackReason: lastReason }
}
