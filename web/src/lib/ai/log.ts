/** Structured AI-call logging. Deliberately excludes customer content / PII. */
export type AiCallLog = {
  provider: 'openai' | 'gemini' | 'none'
  model: string
  latencyMs: number
  success: boolean
  fallbackReason?: string
  usage?: { inputTokens?: number; outputTokens?: number; totalTokens?: number }
  sessionId?: string
}

export function logAiCall(entry: AiCallLog): void {
  // Only operational metadata — never messages, names, phones or secrets.
  console.info('[ai]', JSON.stringify(entry))
}
