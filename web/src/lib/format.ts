import { FINISH_OPTIONS, USE_OPTIONS } from './catalogue'

/** Get a URL from an upload relationship value (number id or populated Media). */
export const mediaUrl = (m: unknown): string | null =>
  m && typeof m === 'object' && 'url' in m ? ((m as { url?: string }).url ?? null) : null

/** Get a display name from a populated relationship (or null if not populated). */
export const relName = (r: unknown): string | null =>
  r && typeof r === 'object' && 'name' in r ? ((r as { name?: string }).name ?? null) : null

export const finishLabel = (v?: string | null): string | null =>
  FINISH_OPTIONS.find((o) => o.value === v)?.label ?? null

export const usageLabel = (v: string): string => USE_OPTIONS.find((o) => o.value === v)?.label ?? v
