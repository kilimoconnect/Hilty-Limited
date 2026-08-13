/**
 * Deterministic calculator tests: normal, missing-data, unrealistic measurements.
 *   npm run test:calc
 */
import { calculate, recommendPacks, wallAreaOf, ceilingAreaOf, type RoomInput, type ComponentInput } from './lib/calc'

let pass = 0
let fail = 0
const approx = (a: number, b: number, eps = 0.02) => Math.abs(a - b) <= eps
const check = (name: string, cond: boolean, detail = '') => {
  console.log(`  ${cond ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`)
  if (cond) pass++
  else fail++
}

const room = (o: Partial<RoomInput> = {}): RoomInput => ({
  length: 4, width: 3, height: 2.7, doors: 1, windows: 1, includeCeiling: true, ...o,
})
const topcoat = (coverage: number | null, coats = 2): ComponentInput => ({
  key: 'topcoat', label: 'Topcoat', coats, coverage, appliesTo: 'both', packSizes: [1, 4, 20], productName: 'Test Topcoat',
})

// --- Formula checks ---
const r = room()
check('wall area = 2(l+w)h − openings', approx(wallAreaOf(r), 2 * 7 * 2.7 - (1.89 + 1.5)), `${wallAreaOf(r)}`)
check('ceiling area = l×w', approx(ceilingAreaOf(r), 12))
check('ceiling excluded when unchecked', ceilingAreaOf(room({ includeCeiling: false })) === 0)
check('openings never make walls negative', wallAreaOf(room({ doors: 50, windows: 50 })) === 0)

// --- Normal case ---
const normal = calculate([r], [topcoat(11)], { wastePct: 10 })
const tc = normal.components[0]
check('normal: no validation issues', normal.issues.length === 0)
check('normal: litres computed (~9.28)', tc.litres != null && approx(tc.litres, ((34.41 + 12) * 2) / 11 * 1.1), `${tc.litres}`)
check('normal: packs recommended, cover requirement', !!tc.packs && packVolume(tc.packs) >= (tc.litres ?? 0))
check('normal: coverage not flagged missing', tc.coverageMissing === false)

// --- Multi-room + separate components (primer + topcoat) ---
const primer: ComponentInput = { key: 'primer', label: 'Primer', coats: 1, coverage: 8, appliesTo: 'walls', packSizes: [1, 4], productName: 'Test Primer' }
const multi = calculate([room(), room({ length: 5, width: 4 })], [primer, topcoat(11)], { wastePct: 15 })
check('multi: primer and topcoat calculated separately', multi.components.length === 2 && multi.components[0].key === 'primer')
check('multi: primer applies to walls only', multi.components[0].area === multi.totals.wallArea)
check('multi: waste factor 1.15 applied', multi.wasteFactor === 1.15)

// --- Missing-data case (unverified/absent coverage) ---
const missing = calculate([r], [topcoat(null)], { wastePct: 10 })
check('missing coverage: litres is null (never invented)', missing.components[0].litres === null)
check('missing coverage: flagged coverageMissing', missing.components[0].coverageMissing === true)
check('missing coverage: no pack recommendation', missing.components[0].packs === null)

// --- Unrealistic measurements ---
const badHeight = calculate([room({ height: 50 })], [topcoat(11)])
check('unrealistic height: validation issue raised', badHeight.issues.some((i) => i.field === 'height'))
check('unrealistic height: litres withheld', badHeight.components[0].litres === null)
const negative = calculate([room({ length: -3 })], [topcoat(11)])
check('negative length: validation issue raised', negative.issues.some((i) => i.field === 'length'))
const fractionalDoors = calculate([room({ doors: 1.5 })], [topcoat(11)])
check('fractional doors: validation issue raised', fractionalDoors.issues.some((i) => i.field === 'doors'))

// --- Pack recommendation minimises excess ---
const packs5 = recommendPacks(5, [1, 4, 20])
check('packs: 5 L → 4 L + 1 L (zero excess)', !!packs5 && packVolume(packs5) === 5, JSON.stringify(packs5))
const packsBig = recommendPacks(5000, [1, 4, 20])
check('packs: beyond max → null (contact branch)', packsBig === null)
const packsNoSizes = recommendPacks(5, [])
check('packs: no pack sizes → null', packsNoSizes === null)

function packVolume(packs: { size: number; qty: number }[]): number {
  return Math.round(packs.reduce((s, p) => s + p.size * p.qty, 0) * 100) / 100
}

console.log(`\n${fail === 0 ? 'ALL CALCULATOR TESTS PASSED ✓' : fail + ' FAILED ✗'} (${pass} passed, ${fail} failed)`)
process.exit(fail === 0 ? 0 : 1)
