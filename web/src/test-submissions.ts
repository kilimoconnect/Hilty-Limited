/**
 * Tests every public submission path + staff notification + upload security.
 *   npm run test:submissions
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from './payload.config'
import { submitEnquiry, submitPainter, submitSiteVisit } from './lib/submissions'
import { validateUpload } from './lib/uploads'

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
)
const EXE = Buffer.from('4d5a90000300000004000000ffff0000b8000000', 'hex') // MZ (Windows PE)
const MARK = 'ZZTEST'

let pass = 0
let fail = 0
const check = (name: string, cond: boolean, detail = '') => {
  console.log(`  ${cond ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`)
  if (cond) pass++
  else fail++
}

async function run() {
  const payload = await getPayload({ config })

  // 1) Site-visit request
  const sv = await submitSiteVisit({ name: `${MARK} Visit`, phone: '+255700000001', consent: true })
  check('site-visit created', sv.ok, sv.reference ?? sv.error ?? '')
  check('site-visit staff notified', sv.notified === true)

  // 2) Painter registration
  const pn = await submitPainter({ fullName: `${MARK} Painter`, phone: '+255700000002', consent: true, districts: ['Kinondoni'], skills: ['spray'] })
  check('painter created', pn.ok, pn.reference ?? pn.error ?? '')
  check('painter staff notified', pn.notified === true)

  // 3) Enquiry (no file)
  const en = await submitEnquiry({ type: 'project_pricing', name: `${MARK} Enquiry`, phone: '+255700000003', consent: true, company: `${MARK} Co` })
  check('enquiry created', en.ok, en.reference ?? en.error ?? '')
  check('enquiry staff notified', en.notified === true)

  // 4) Enquiry WITH a valid BOQ (png) upload
  const enFile = await submitEnquiry(
    { type: 'bulk_supply', name: `${MARK} Enquiry File`, phone: '+255700000004', consent: true },
    [{ name: `${MARK}-boq.png`, type: 'image/png', buffer: PNG }],
  )
  check('enquiry-with-upload created', enFile.ok, enFile.reference ?? enFile.error ?? '')
  const uploadedDocs = await payload.find({ collection: 'documents', where: { label: { equals: `${MARK}-boq.png` } }, limit: 5, overrideAccess: true })
  check('BOQ document stored privately', uploadedDocs.totalDocs >= 1)

  // 5) Upload security — reject executable by extension
  check('reject .exe extension', validateUpload({ name: 'evil.exe', type: 'application/pdf', buffer: EXE }) !== null)
  // reject MZ signature even with .pdf name
  check('reject MZ signature disguised as .pdf', validateUpload({ name: 'evil.pdf', type: 'application/pdf', buffer: EXE }) !== null)
  // reject oversize
  check('reject oversize file', validateUpload({ name: 'big.pdf', type: 'application/pdf', buffer: Buffer.alloc(11 * 1024 * 1024, 0x25) }) !== null)
  // accept a valid image
  check('accept valid png', validateUpload({ name: 'ok.png', type: 'image/png', buffer: PNG }) === null)

  // 6) Validation — missing consent / required fields
  const noConsent = await submitSiteVisit({ name: `${MARK} NC`, phone: '+255700000005', consent: false })
  check('reject missing consent', noConsent.ok === false && !!noConsent.error)
  const missing = await submitPainter({ fullName: '', phone: '', consent: true })
  check('reject missing required fields', missing.ok === false && !!missing.error)

  // Cleanup test records
  const del = async (collection: string, where: object) => {
    const res = await payload.find({ collection: collection as never, where: where as never, limit: 50, overrideAccess: true })
    for (const d of res.docs) await payload.delete({ collection: collection as never, id: (d as { id: number }).id, overrideAccess: true })
    return res.docs.length
  }
  await del('site-visit-requests', { name: { like: MARK } })
  await del('painters', { fullName: { like: MARK } })
  await del('enquiries', { name: { like: MARK } })
  await del('documents', { label: { like: MARK } })

  console.log(`\n${fail === 0 ? 'ALL SUBMISSION TESTS PASSED ✓' : fail + ' FAILED ✗'} (${pass} passed, ${fail} failed)`)
  process.exit(fail === 0 ? 0 : 1)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
