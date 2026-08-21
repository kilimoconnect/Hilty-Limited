export type ImageConfig = {
  primary: 'openai' | 'gemini'
  openaiModel: string
  geminiModel: string
  timeoutMs: number
  maxUploadMb: number
  maxGenerationsPerSession: number
  dailyLimitPerIp: number
  retentionDays: number
  storageBucket: string
  maxRetries: number
}

const intOr = (v: string | undefined, d: number) => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : d
}

export function getImageConfig(): ImageConfig {
  return {
    primary: process.env.IMAGE_PRIMARY_PROVIDER === 'gemini' ? 'gemini' : 'openai',
    // Models are configurable — never hard-code specific model names.
    openaiModel: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
    geminiModel: process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image',
    timeoutMs: intOr(process.env.IMAGE_GENERATION_TIMEOUT_MS, 45_000),
    maxUploadMb: intOr(process.env.IMAGE_MAX_UPLOAD_MB, 12),
    maxGenerationsPerSession: intOr(process.env.IMAGE_MAX_GENERATIONS_PER_SESSION, 20),
    dailyLimitPerIp: intOr(process.env.IMAGE_DAILY_LIMIT_PER_IP, 50),
    retentionDays: intOr(process.env.DESIGN_IMAGE_RETENTION_DAYS, 30),
    storageBucket: process.env.DESIGN_STORAGE_BUCKET || '',
    maxRetries: 2,
  }
}
