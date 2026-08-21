/** Shared types for the provider-independent AI Paint Advisor. Server-side only. */

export type AdvisorLanguage = 'en' | 'sw'
export type LeadReadiness = 'not_ready' | 'needs_consent' | 'ready'
export type NextAction =
  | 'ask_more'
  | 'use_calculator'
  | 'request_quote'
  | 'book_visit'
  | 'find_branch'
  | 'whatsapp'
  | 'human_handoff'
export type ProviderName = 'openai' | 'gemini' | 'none'

export type RecommendedProduct = { id: number | null; name: string; why: string | null }

/** The validated structured response returned to the caller. */
export type AdvisorResponse = {
  customer_message: string
  language: AdvisorLanguage
  detected_intent: string
  project_summary: string
  recommended_products: RecommendedProduct[]
  recommended_system_steps: string[]
  missing_information: string[]
  calculator_result_reference: string | null
  lead_readiness: LeadReadiness
  suggested_next_action: NextAction
  needs_human: boolean
  safety_or_uncertainty_note: string | null
  provider_used: ProviderName
}

export type ChatMessage = { role: 'user' | 'assistant'; content: string }

export type AdvisorRequest = {
  messages: ChatMessage[]
  locale: AdvisorLanguage
  /** Explicit customer consent to store a lead (server-enforced). */
  consentGiven?: boolean
  /** Opaque IP hash / id for rate-limiting only (never stored as PII). */
  clientId?: string
  sessionId?: string
}

export type TokenUsage = { inputTokens?: number; outputTokens?: number; totalTokens?: number }

export type ProviderResult = { response: AdvisorResponse; usage?: TokenUsage }

export type AiErrorKind = 'timeout' | 'rate_limit' | 'server' | 'outage' | 'invalid_schema' | 'bad_request' | 'other'

export class AiError extends Error {
  kind: AiErrorKind
  status?: number
  constructor(kind: AiErrorKind, message: string, status?: number) {
    super(message)
    this.name = 'AiError'
    this.kind = kind
    this.status = status
  }
}

/** Only these reasons may trigger fallback to the backup provider. */
export const FALLBACKABLE: AiErrorKind[] = ['timeout', 'rate_limit', 'server', 'outage', 'invalid_schema']

/** A server-executed tool call requested by the model. */
export type ToolCall = { name: string; arguments: Record<string, unknown> }
/** Executes a tool server-side (validates args, runs it) and returns a JSON-serialisable result. */
export type ToolExecutor = (call: ToolCall) => Promise<Record<string, unknown>>

/** Common provider interface. Each provider runs the tool loop internally and returns a validated response. */
export interface AiProvider {
  readonly name: 'openai' | 'gemini'
  readonly model: string
  /** Throw AiError with the correct kind on failure. Respect the abort signal for timeouts. */
  generate(req: AdvisorRequest, executor: ToolExecutor, signal: AbortSignal, repairHint?: string): Promise<ProviderResult>
}
