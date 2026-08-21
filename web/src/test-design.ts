/**
 * Mocked Design Studio backend tests (no network / no real keys).
 *   npm run test:design
 * Covers: uploads (validate/re-encode/EXIF strip), permissions (private collections), masking,
 * OpenAI success, Gemini fallback, both providers failing, rate limits, image deletion.
 */
import 'dotenv/config'
import sharp from 'sharp'
import { getPayload } from 'payload'
import config from './payload.config'
import { AiError, type ImageProvider, type ImageResult } from './lib/design/image/types'
import { runImageFailover } from './lib/design/image/service'
import { validateAndProcessImage, hasExif, storePrivateImage } from './lib/design/uploads'
import { canRender, confirmedTypes, nextMaskVersion, proposeInitialSurfaces } from './lib/design/masking'
import { generateVariant } from './lib/design/variant'
import { deleteProject } from './lib/design/lifecycle'
import { _resetImageQuota } from './lib/design/quota'

let pass = 0
let fail = 0
const check = (name: string, cond: boolean, detail = '') => {
  console.log(`  ${cond ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`)
  if (cond) pass++
  else fail++
}
const MARK = 'ZZDSTEST'
const opts = { timeoutMs: 120, maxRetries: 1 }

const mkImg = (name: 'openai' | 'gemini', impl: ImageProvider['generate']): ImageProvider => ({ name, model: `${name}-img`, generate: impl })
const okImg = (name: 'openai' | 'gemini', bytes: Buffer) => mkImg(name, async (): Promise<ImageResult> => ({ imageBytes: bytes, mimeType: 'image/png', provider: name, model: `${name}-img`, usage: { imageCount: 1 } }))
const hangImg = (name: 'openai' | 'gemini') => mkImg(name, () => new Promise<ImageResult>(() => {}))
const throwImg = (name: 'openai' | 'gemini', err: AiError) => mkImg(name, async () => { throw err })

async function uploadTests(png: Buffer, jpeg: Buffer, webp: Buffer) {
  console.log('\nUploads:')
  const p1 = await validateAndProcessImage({ buffer: png, filename: 'room.png', declaredMime: 'image/png', maxMB: 12 })
  check('accept PNG, re-encoded', p1.mime === 'image/png' && p1.width === 120 && p1.height === 90)
  check('processed image has no EXIF', (await hasExif(p1.buffer)) === false)
  const p2 = await validateAndProcessImage({ buffer: jpeg, filename: 'room.jpg', maxMB: 12 })
  check('accept JPEG', p2.mime === 'image/jpeg')
  const p3 = await validateAndProcessImage({ buffer: webp, filename: 'room.webp', maxMB: 12 })
  check('accept WebP', p3.mime === 'image/webp')

  const reject = async (label: string, fn: () => Promise<unknown>) => {
    try {
      await fn()
      check(label, false, 'did not reject')
    } catch {
      check(label, true)
    }
  }
  await reject('reject non-image bytes', () => validateAndProcessImage({ buffer: Buffer.from('not an image'), filename: 'x.png', maxMB: 12 }))
  await reject('reject extension mismatch', () => validateAndProcessImage({ buffer: png, filename: 'room.txt', maxMB: 12 }))
  await reject('reject declared-MIME mismatch', () => validateAndProcessImage({ buffer: png, filename: 'room.png', declaredMime: 'image/jpeg', maxMB: 12 }))
  await reject('reject oversize', () => validateAndProcessImage({ buffer: Buffer.alloc(2 * 1024 * 1024, 0), filename: 'room.png', maxMB: 1 }))
}

function maskingTests() {
  console.log('\nMasking:')
  const interior = proposeInitialSurfaces({ surfaceType: 'living_room', interiorExterior: 'interior' }).map((s) => s.type)
  check('interior suggests wall + ceiling', interior.includes('wall') && interior.includes('ceiling'))
  check('roof suggests roof', proposeInitialSurfaces({ surfaceType: 'roof' }).some((s) => s.type === 'roof'))
  check('gate/metal suggests gate + metal', proposeInitialSurfaces({ surfaceType: 'gate_metal' }).map((s) => s.type).join() === 'gate,metal')
  check('no render until confirmed', canRender([{ confirmedByUser: false }]) === false)
  check('render allowed once confirmed', canRender([{ confirmedByUser: true }]) === true)
  check('mask version increments', nextMaskVersion(2) === 3 && nextMaskVersion(null) === 1)
  check('confirmedTypes filters', confirmedTypes([{ type: 'wall', confirmedByUser: true }, { type: 'ceiling', confirmedByUser: false }]).join() === 'wall')
}

async function failoverTests(png: Buffer) {
  console.log('\nImage failover:')
  const r1 = await runImageFailover(okImg('openai', png), okImg('gemini', png), { mode: 'generate', prompt: 'x' }, opts)
  check('OpenAI success', r1.ok === true && r1.ok && r1.result.provider === 'openai')
  const r2 = await runImageFailover(hangImg('openai'), okImg('gemini', png), { mode: 'generate', prompt: 'x' }, opts)
  check('OpenAI timeout -> Gemini', r2.ok === true && r2.ok && r2.result.provider === 'gemini' && r2.fallbackReason === 'timeout')
  const r3 = await runImageFailover(throwImg('openai', new AiError('server', '500', 500)), okImg('gemini', png), { mode: 'generate', prompt: 'x' }, opts)
  check('OpenAI 5xx -> Gemini', r3.ok === true && r3.ok && r3.result.provider === 'gemini')
  const r4 = await runImageFailover(throwImg('openai', new AiError('outage', 'down')), throwImg('gemini', new AiError('outage', 'down')), { mode: 'generate', prompt: 'x' }, opts)
  check('both fail -> human assistance', r4.ok === false && r4.humanAssistance === true)
}

async function variantAndLifecycleTests(png: Buffer) {
  console.log('\nVariant generation, quota, permissions & deletion:')
  const payload = await getPayload({ config })

  // clean leftovers
  const cleanAll = async () => {
    const projs = await payload.find({ collection: 'design-projects', where: { name: { like: MARK } }, limit: 100, overrideAccess: true })
    for (const p of projs.docs) await deleteProject(payload, p.id)
  }
  await cleanAll()

  const project = await payload.create({ collection: 'design-projects', data: { name: `${MARK} Project` } as never, overrideAccess: true })
  const imgId = await storePrivateImage(payload, png, 'image/png', `${MARK}-orig.png`, 'design')
  const space = await payload.create({ collection: 'design-spaces', data: { project: project.id, name: `${MARK} Room`, originalImage: imgId } as never, overrideAccess: true })

  // Permissions: private collections not readable without a user
  let denied = false
  try {
    const res = await payload.find({ collection: 'design-projects', where: { name: { like: MARK } }, overrideAccess: false })
    denied = res.totalDocs === 0
  } catch {
    denied = true
  }
  check('design-projects not publicly readable', denied)

  _resetImageQuota()
  const deps = { payload, primary: okImg('openai', png), backup: okImg('gemini', png), opts, cfg: { maxGenerationsPerSession: 1, dailyLimitPerIp: 50 } }
  const baseInput = { spaceId: space.id, baseImage: png, paletteRoles: [{ role: 'wall', shadeName: 'Soft Grey' }], sessionId: `${MARK}-s`, clientId: `${MARK}-ip` }

  // disclaimer + confirmation gating
  const d1 = await generateVariant(deps, { ...baseInput, surfaces: [{ type: 'wall', confirmedByUser: true }], disclaimerAccepted: false })
  check('blocked without disclaimer', d1.ok === false && d1.error === 'disclaimer_required')
  const d2 = await generateVariant(deps, { ...baseInput, surfaces: [{ type: 'wall', confirmedByUser: false }], disclaimerAccepted: true })
  check('blocked until surface confirmed', d2.ok === false && d2.error === 'surfaces_not_confirmed')

  // happy path
  const ok = await generateVariant(deps, { ...baseInput, surfaces: [{ type: 'wall', confirmedByUser: true }], disclaimerAccepted: true })
  check('variant generated + stored', ok.ok === true && ok.ok && ok.provider === 'openai')
  const variants = await payload.find({ collection: 'design-variants', where: { space: { equals: space.id } }, overrideAccess: true })
  check('design-variant record created (succeeded, watermarked image)', variants.docs.some((v) => v.status === 'succeeded' && !!v.image))

  // quota (session limit = 1 already used)
  const q = await generateVariant(deps, { ...baseInput, surfaces: [{ type: 'wall', confirmedByUser: true }], disclaimerAccepted: true })
  check('session quota enforced', q.ok === false && q.error === 'session_limit')

  // both providers fail -> project preserved + failed variant
  _resetImageQuota()
  const failDeps = { ...deps, primary: throwImg('openai', new AiError('outage', 'x')), backup: throwImg('gemini', new AiError('outage', 'x')) }
  const bf = await generateVariant(failDeps, { ...baseInput, surfaces: [{ type: 'wall', confirmedByUser: true }], disclaimerAccepted: true })
  check('both-fail returns human assistance, project preserved', bf.ok === false && bf.humanAssistance === true && (await payload.findByID({ collection: 'design-projects', id: project.id, overrideAccess: true })).id === project.id)

  // Image deletion (customer right)
  const docsBefore = (await payload.find({ collection: 'documents', where: { label: { like: MARK } }, overrideAccess: true })).totalDocs
  const del = await deleteProject(payload, project.id)
  const projGone = (await payload.find({ collection: 'design-projects', where: { name: { like: MARK } }, overrideAccess: true })).totalDocs === 0
  const imgsGone = (await payload.find({ collection: 'documents', where: { label: { like: MARK } }, overrideAccess: true })).totalDocs === 0
  check('deleteProject cascades (spaces/variants deleted)', del.deleted.project === 1 && del.deleted.spaces >= 1 && del.deleted.variants >= 1)
  check('project + private images deleted', projGone && imgsGone && docsBefore >= 1)
}

async function run() {
  const png = await sharp({ create: { width: 120, height: 90, channels: 3, background: { r: 180, g: 120, b: 60 } } }).png().toBuffer()
  const jpeg = await sharp({ create: { width: 120, height: 90, channels: 3, background: { r: 60, g: 120, b: 180 } } }).jpeg().toBuffer()
  const webp = await sharp({ create: { width: 120, height: 90, channels: 3, background: { r: 90, g: 160, b: 90 } } }).webp().toBuffer()

  await uploadTests(png, jpeg, webp)
  maskingTests()
  await failoverTests(png)
  await variantAndLifecycleTests(png)

  console.log(`\n${fail === 0 ? 'ALL DESIGN STUDIO TESTS PASSED ✓' : fail + ' FAILED ✗'} (${pass} passed, ${fail} failed)`)
  process.exit(fail === 0 ? 0 : 1)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
