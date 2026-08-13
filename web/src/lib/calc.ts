/**
 * Deterministic paint calculator — PURE application code (no AI, no I/O).
 * Coverage and coat data must come from VERIFIED product records; when verified
 * coverage is missing we return `null` litres and never invent a number.
 *
 * Core formulas (per the brief):
 *   Wall area   = 2 × (length + width) × height − openings
 *   Ceiling area = length × width
 *   Paint litres = (area × coats ÷ coverage) × wasteFactor
 */

export const DEFAULT_DOOR_AREA = 1.89 // m² (~0.9 × 2.1)
export const DEFAULT_WINDOW_AREA = 1.5 // m² (~1.2 × 1.25)
export const DEFAULT_WASTE_PCT = 10 // %
export const MAX_TOTAL_LITRES = 2000 // above this, recommend contacting a branch

// Realistic bounds for validation
const LIMITS = {
  side: { min: 0.1, max: 60 }, // length / width (m)
  height: { min: 1.5, max: 20 }, // (m)
  openings: { max: 100 },
  coats: { min: 1, max: 6 },
  wastePct: { min: 0, max: 50 },
  rooms: { max: 100 },
}

export type RoomInput = {
  name?: string
  length: number
  width: number
  height: number
  doors: number
  windows: number
  includeCeiling: boolean
}

export type CalcConfig = {
  doorArea?: number
  windowArea?: number
  wastePct?: number
}

export type ComponentInput = {
  key: 'primer' | 'topcoat' | 'other'
  label: string
  coats: number
  coverage: number | null // m² per litre from a VERIFIED product, or null
  productId?: number
  productName?: string
  packSizes?: number[] // litres
  appliesTo?: 'walls' | 'ceiling' | 'both'
}

export type ValidationIssue = { room?: number; field: string; message: string }

export type ComponentResult = {
  key: string
  label: string
  productName?: string
  area: number
  coats: number
  coverage: number | null
  litres: number | null
  coverageMissing: boolean
  packs: { size: number; qty: number }[] | null
  tooLarge?: boolean
}

export type CalcResult = {
  estimate: true
  perRoom: { name: string; wallArea: number; ceilingArea: number }[]
  totals: { wallArea: number; ceilingArea: number }
  wasteFactor: number
  wastePct: number
  components: ComponentResult[]
  issues: ValidationIssue[]
}

const round2 = (n: number) => Math.round(n * 100) / 100

export function validateRooms(rooms: RoomInput[]): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  if (!rooms.length) issues.push({ field: 'rooms', message: 'Add at least one room.' })
  if (rooms.length > LIMITS.rooms.max) issues.push({ field: 'rooms', message: `Too many rooms (max ${LIMITS.rooms.max}).` })
  rooms.forEach((r, i) => {
    const num = (v: number) => typeof v === 'number' && isFinite(v)
    if (!num(r.length) || r.length < LIMITS.side.min || r.length > LIMITS.side.max)
      issues.push({ room: i, field: 'length', message: `Length must be between ${LIMITS.side.min} and ${LIMITS.side.max} m.` })
    if (!num(r.width) || r.width < LIMITS.side.min || r.width > LIMITS.side.max)
      issues.push({ room: i, field: 'width', message: `Width must be between ${LIMITS.side.min} and ${LIMITS.side.max} m.` })
    if (!num(r.height) || r.height < LIMITS.height.min || r.height > LIMITS.height.max)
      issues.push({ room: i, field: 'height', message: `Height must be between ${LIMITS.height.min} and ${LIMITS.height.max} m.` })
    if (!num(r.doors) || r.doors < 0 || r.doors > LIMITS.openings.max || !Number.isInteger(r.doors))
      issues.push({ room: i, field: 'doors', message: 'Doors must be a whole number (0–100).' })
    if (!num(r.windows) || r.windows < 0 || r.windows > LIMITS.openings.max || !Number.isInteger(r.windows))
      issues.push({ room: i, field: 'windows', message: 'Windows must be a whole number (0–100).' })
  })
  return issues
}

export function wallAreaOf(r: RoomInput, cfg: CalcConfig = {}): number {
  const doorArea = cfg.doorArea ?? DEFAULT_DOOR_AREA
  const windowArea = cfg.windowArea ?? DEFAULT_WINDOW_AREA
  const gross = 2 * (r.length + r.width) * r.height
  const openings = r.doors * doorArea + r.windows * windowArea
  return Math.max(0, gross - openings)
}

export function ceilingAreaOf(r: RoomInput): number {
  return r.includeCeiling ? r.length * r.width : 0
}

export function litresFor(area: number, coats: number, coverage: number | null, wasteFactor: number): number | null {
  if (coverage == null || coverage <= 0) return null
  if (area <= 0 || coats <= 0) return 0
  return (area * coats) / coverage * wasteFactor
}

/**
 * Recommend pack combinations that meet the required litres with the least excess,
 * then the fewest packs. Volume-only optimisation (never price). Returns null if no
 * pack sizes, nothing required, or the requirement is beyond MAX_TOTAL_LITRES.
 */
export function recommendPacks(requiredLitres: number, packSizes: number[]): { size: number; qty: number }[] | null {
  const sizes = [...new Set(packSizes.filter((s) => s > 0))].sort((a, b) => a - b)
  if (!sizes.length || requiredLitres <= 0) return null
  if (requiredLitres > MAX_TOTAL_LITRES) return null

  const scale = 10 // deciliters
  const target = Math.ceil(requiredLitres * scale)
  const maxSizeD = Math.round(sizes[sizes.length - 1] * scale)
  const cap = target + maxSizeD
  const dp = new Array<number>(cap + 1).fill(Infinity)
  const choice = new Array<number>(cap + 1).fill(-1)
  dp[0] = 0
  for (let v = 1; v <= cap; v++) {
    for (const s of sizes) {
      const sd = Math.round(s * scale)
      if (v - sd >= 0 && dp[v - sd] + 1 < dp[v]) {
        dp[v] = dp[v - sd] + 1
        choice[v] = sd
      }
    }
  }
  let best = -1
  for (let v = target; v <= cap; v++) {
    if (dp[v] < Infinity) {
      best = v // smallest volume >= target => least excess
      break
    }
  }
  if (best < 0) return null
  const counts = new Map<number, number>()
  let v = best
  while (v > 0) {
    const sd = choice[v]
    if (sd < 0) break
    counts.set(sd, (counts.get(sd) ?? 0) + 1)
    v -= sd
  }
  return [...counts.entries()].map(([sd, qty]) => ({ size: sd / scale, qty })).sort((a, b) => b.size - a.size)
}

export function calculate(rooms: RoomInput[], components: ComponentInput[], cfg: CalcConfig = {}): CalcResult {
  const issues = validateRooms(rooms)
  const wastePct = Math.min(Math.max(cfg.wastePct ?? DEFAULT_WASTE_PCT, LIMITS.wastePct.min), LIMITS.wastePct.max)
  const wasteFactor = 1 + wastePct / 100

  const perRoom = rooms.map((r, i) => ({
    name: r.name?.trim() || `Room ${i + 1}`,
    wallArea: round2(wallAreaOf(r, cfg)),
    ceilingArea: round2(ceilingAreaOf(r)),
  }))
  const wallArea = round2(perRoom.reduce((s, r) => s + r.wallArea, 0))
  const ceilingArea = round2(perRoom.reduce((s, r) => s + r.ceilingArea, 0))

  const componentResults: ComponentResult[] = components.map((c) => {
    const applies = c.appliesTo ?? 'both'
    const area = round2(applies === 'walls' ? wallArea : applies === 'ceiling' ? ceilingArea : wallArea + ceilingArea)
    const coats = Math.min(Math.max(c.coats || 1, LIMITS.coats.min), LIMITS.coats.max)
    const litresRaw = issues.length === 0 ? litresFor(area, coats, c.coverage, wasteFactor) : null
    const litres = litresRaw == null ? null : round2(litresRaw)
    const tooLarge = litres != null && litres > MAX_TOTAL_LITRES
    const packs = litres != null && !tooLarge && c.packSizes?.length ? recommendPacks(litres, c.packSizes) : null
    return {
      key: c.key,
      label: c.label,
      productName: c.productName,
      area,
      coats,
      coverage: c.coverage,
      litres,
      coverageMissing: c.coverage == null || c.coverage <= 0,
      packs,
      tooLarge,
    }
  })

  return {
    estimate: true,
    perRoom,
    totals: { wallArea, ceilingArea },
    wasteFactor,
    wastePct,
    components: componentResults,
    issues,
  }
}
