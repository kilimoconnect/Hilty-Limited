export type AiConfig = {
  primary: 'openai' | 'gemini'
  timeoutMs: number
  maxInputChars: number
  rateLimitPerIp: number
  retentionDays: number
  maxRetries: number
  openaiModel: string
  geminiModel: string
}

const intOr = (v: string | undefined, d: number) => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : d
}

export function getAiConfig(): AiConfig {
  return {
    primary: process.env.AI_PRIMARY_PROVIDER === 'gemini' ? 'gemini' : 'openai',
    timeoutMs: intOr(process.env.AI_TIMEOUT_MS, 20_000),
    maxInputChars: intOr(process.env.AI_MAX_INPUT_CHARACTERS, 4_000),
    rateLimitPerIp: intOr(process.env.AI_RATE_LIMIT_PER_IP, 20),
    retentionDays: intOr(process.env.AI_CONVERSATION_RETENTION_DAYS, 30),
    maxRetries: 2,
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  }
}
