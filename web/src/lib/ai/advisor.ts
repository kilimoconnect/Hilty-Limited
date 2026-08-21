import { getAiConfig } from './config'
import { createToolExecutor } from './tools'
import { checkRateLimit } from './ratelimit'
import { runFailover, safeFallbackResponse } from './service'
import { OpenAiProvider } from './openai'
import { GeminiProvider } from './gemini'
import type { AdvisorRequest, AdvisorResponse, AiProvider } from './types'

export type AdvisorOutcome = { response: AdvisorResponse; fallbackReason?: string; blocked?: 'rate_limit' | 'too_long' }

function tryBuild(name: 'openai' | 'gemini', model: string): AiProvider | null {
  try {
    return name === 'openai' ? new OpenAiProvider(model) : new GeminiProvider(model)
  } catch {
    return null // missing key / unavailable
  }
}

/**
 * Public entry: enforces input-length + rate limits, wires OpenAI (primary) and Gemini (backup),
 * and runs failover. Server-side only.
 */
export async function runAdvisor(req: AdvisorRequest): Promise<AdvisorOutcome> {
  const cfg = getAiConfig()

  // Input-length limit
  const totalChars = req.messages.reduce((s, m) => s + (m.content?.length ?? 0), 0)
  if (totalChars > cfg.maxInputChars) {
    const r = safeFallbackResponse(req.locale)
    r.customer_message =
      req.locale === 'sw'
        ? 'Ujumbe wako ni mrefu sana. Tafadhali fupisha maelezo au tumia kikokotoo cha rangi au WhatsApp.'
        : 'Your message is too long. Please shorten it, or use the paint calculator or WhatsApp.'
    return { response: r, blocked: 'too_long' }
  }

  // Rate limiting (per client/IP)
  const rl = checkRateLimit(req.clientId || 'anonymous', cfg.rateLimitPerIp)
  if (!rl.allowed) {
    const r = safeFallbackResponse(req.locale)
    r.customer_message =
      req.locale === 'sw'
        ? 'Umefanya maombi mengi kwa muda mfupi. Tafadhali jaribu tena baadaye au tumia WhatsApp.'
        : 'Too many requests in a short time. Please try again shortly, or use WhatsApp.'
    return { response: r, blocked: 'rate_limit' }
  }

  const primaryName = cfg.primary
  const backupName = primaryName === 'openai' ? 'gemini' : 'openai'
  const primaryModel = primaryName === 'openai' ? cfg.openaiModel : cfg.geminiModel
  const backupModel = backupName === 'openai' ? cfg.openaiModel : cfg.geminiModel

  const primary = tryBuild(primaryName, primaryModel)
  const backup = tryBuild(backupName, backupModel)

  const executor = createToolExecutor({ consentGiven: req.consentGiven, locale: req.locale })
  const opts = { timeoutMs: cfg.timeoutMs, maxRetries: cfg.maxRetries, sessionId: req.sessionId }

  if (!primary && !backup) {
    return { response: safeFallbackResponse(req.locale), fallbackReason: 'no_provider_configured' }
  }
  if (!primary) return runFailover(backup as AiProvider, null, req, executor, opts)
  return runFailover(primary, backup, req, executor, opts)
}
