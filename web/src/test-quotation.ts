/**
 * Quotation-workflow tests: normal, missing-coverage, unrealistic, consent, spam.
 * Verifies the calculation is saved with the request AND a linked lead is created.
 *   npm run test:quotation
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from './payload.config'
import { submitQuotation } from './lib/quotation'
import type { RoomInput } from './lib/calc'

const MARK = 'ZZQTEST'
let pass = 0
let fail = 0
const check = (name: string, cond: boolean, detail = '') => {
  console.log(`  ${cond ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`)
  if (cond) pass++
  else fail++
}
type AnyRec = Record<string, unknown>
const rooms: RoomInput[] = [{ length: 4, width: 3, height: 2.7, doors: 1, windows: 1, includeCeiling: true }]

async function run() {
  const payload = await getPayload({ config })
  const cat = (await payload.find({ collection: 'product-categories', limit: 1, overrideAccess: true })).docs[0]
  if (!cat) throw new Error('No category found — run npm run seed first.')

  const del = async (collection: string, where: object) => {
    const res = await payload.find({ collection: collection as never, where: where as never, limit: 100, overrideAccess: true })
    for (const d of res.docs) await payload.delete({ collection: collection as never, id: (d as { id: number }).id, overrideAccess: true })
  }
  // Pre-clean any leftovers from a previous run (idempotent).
  await del('quotation-requests', { customerName: { like: MARK } })
  await del('leads', { name: { like: MARK } })
  await del('products', { name: { like: MARK } })

  const mkProduct = (name: string, status: 'verified' | 'unverified') =>
    payload.create({
      collection: 'products',
      data: {
        name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), category: cat.id, active: true, quotationEligible: true,
        coveragePerLitre: 11, recommendedCoats: 2,
        packSizes: [{ litres: 1 }, { litres: 4 }, { litres: 20 }],
        verification: { status },
      } as never,
      overrideAccess: true,
    })

  const verified = await mkProduct(`${MARK} Verified Paint`, 'verified')
  const unverified = await mkProduct(`${MARK} Unverified Paint`, 'unverified')

  // 1) Normal
  const r1 = await submitQuotation({ customerName: `${MARK} A`, phone: '+255700000010', email: 'test@example.com', consent: true, rooms, topcoatProductId: verified.id, topcoatCoats: 2, wastePct: 10, projectType: 'Repaint' })
  check('normal: quotation created', r1.ok, r1.reference ?? r1.error ?? '')
  check('normal: staff notified', r1.notified === true)
  const saved = (await payload.find({ collection: 'quotation-requests', where: { reference: { equals: r1.reference } }, overrideAccess: true })).docs[0] as unknown as AnyRec | undefined
  const calc = saved?.calculation as AnyRec | undefined
  const comp0 = (calc?.components as AnyRec[] | undefined)?.[0]
  check('normal: calculation saved with request', !!calc && typeof comp0?.litres === 'number' && (comp0.litres as number) > 0, String(comp0?.litres))
  const leads = await payload.find({ collection: 'leads', where: { name: { like: MARK } }, overrideAccess: true, limit: 50 })
  check('normal: linked lead created (source=quotation)', leads.docs.some((l) => (l as unknown as AnyRec).source === 'quotation'))

  // 2) Missing coverage (unverified product) — still saved, litres null
  const r2 = await submitQuotation({ customerName: `${MARK} B`, phone: '+255700000011', consent: true, rooms, topcoatProductId: unverified.id, topcoatCoats: 2 })
  check('missing coverage: saved as estimate', r2.ok, r2.reference ?? r2.error ?? '')
  const saved2 = (await payload.find({ collection: 'quotation-requests', where: { reference: { equals: r2.reference } }, overrideAccess: true })).docs[0] as unknown as AnyRec | undefined
  const comp2 = ((saved2?.calculation as AnyRec)?.components as AnyRec[] | undefined)?.[0]
  check('missing coverage: litres null (not invented)', comp2?.litres === null && comp2?.coverageMissing === true)

  // 3) Unrealistic measurement
  const r3 = await submitQuotation({ customerName: `${MARK} C`, phone: '+255700000012', consent: true, rooms: [{ length: 4, width: 3, height: 50, doors: 0, windows: 0, includeCeiling: true }], topcoatProductId: verified.id })
  check('unrealistic: rejected with error', r3.ok === false && !!r3.error, r3.error)

  // 4) Missing consent
  const r4 = await submitQuotation({ customerName: `${MARK} D`, phone: '+255700000013', consent: false, rooms, topcoatProductId: verified.id })
  check('missing consent: rejected', r4.ok === false)

  // 5) Honeypot spam
  const r5 = await submitQuotation({ customerName: `${MARK} E`, phone: '+255700000014', consent: true, rooms, topcoatProductId: verified.id, honeypot: 'bot' })
  check('honeypot: spam rejected', r5.ok === false)

  // Cleanup
  await del('quotation-requests', { customerName: { like: MARK } })
  await del('leads', { name: { like: MARK } })
  await del('products', { name: { like: MARK } })

  console.log(`\n${fail === 0 ? 'ALL QUOTATION TESTS PASSED ✓' : fail + ' FAILED ✗'} (${pass} passed, ${fail} failed)`)
  process.exit(fail === 0 ? 0 : 1)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
