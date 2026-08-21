/**
 * Design Studio customer-flow tests (mocked image provider; no network/keys).
 *   npm run test:studio
 */
import 'dotenv/config'
import sharp from 'sharp'
import { getPayload } from 'payload'
import config from './payload.config'
import type { ImageProvider, ImageResult } from './lib/design/image/types'
import {
  attachSpaceImage,
  convertToPlan,
  createDesignProject,
  loadProjectState,
  makePalettes,
  makeVariant,
  removeDesignProject,
  saveDesignLead,
  savePreferences,
  saveSpaceSurfaces,
} from './lib/design/studioFlow'
import { _resetImageQuota } from './lib/design/quota'

let pass = 0
let fail = 0
const check = (name: string, cond: boolean, detail = '') => {
  console.log(`  ${cond ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`)
  if (cond) pass++
  else fail++
}
const okImg = (name: 'openai' | 'gemini', png: Buffer): ImageProvider => ({ name, model: `${name}-img`, generate: async (): Promise<ImageResult> => ({ imageBytes: png, mimeType: 'image/png', provider: name, model: `${name}-img`, usage: {} }) })

async function run() {
  const payload = await getPayload({ config })
  const png = await sharp({ create: { width: 200, height: 150, channels: 3, background: { r: 200, g: 180, b: 150 } } }).png().toBuffer()
  _resetImageQuota()

  // Pre-clean leftovers from any previous run
  const old = await payload.find({ collection: 'design-projects', where: { name: { like: 'ZZSTUDIO' } }, limit: 100, overrideAccess: true })
  for (const p of old.docs) await removeDesignProject(p.id)
  const oldLeads = await payload.find({ collection: 'leads', where: { name: { like: 'ZZ Cust' } }, limit: 100, overrideAccess: true })
  for (const l of oldLeads.docs) await payload.delete({ collection: 'leads', id: l.id, overrideAccess: true })

  // 1) Create project
  const proj = await createDesignProject({ name: 'ZZSTUDIO Living room', sector: 'residential', language: 'en' })
  check('project created with reference', !!proj.projectId && !!proj.reference, proj.reference)

  // 2) Upload space image (ownership required)
  const noOwn = await attachSpaceImage({ projectId: proj.projectId, buffer: png, filename: 'room.png', declaredMime: 'image/png', surfaceType: 'living_room', interiorExterior: 'interior', ownershipConfirmed: false })
  check('upload blocked without ownership confirmation', noOwn.ok === false)
  const up = await attachSpaceImage({ projectId: proj.projectId, buffer: png, filename: 'room.png', declaredMime: 'image/png', surfaceType: 'living_room', interiorExterior: 'interior', ownershipConfirmed: true })
  check('space image processed + suggestions returned', up.ok === true && up.ok && up.suggestions.length > 0)
  const spaceId = up.ok ? up.spaceId : 0

  // 3) Surfaces (versioned, confirm)
  await saveSpaceSurfaces(spaceId, [{ type: 'wall', confirmedByUser: true, mask: [] }])
  const surfs = await payload.find({ collection: 'design-surfaces', where: { space: { equals: spaceId } }, overrideAccess: true })
  check('surface saved + confirmed', surfs.docs.some((s) => s.confirmedByUser === true))

  // 4) Preferences
  await savePreferences(proj.projectId, { temperature: 'warm', preferredFinish: 'matt' })
  check('preferences saved', (await payload.find({ collection: 'design-preferences', where: { project: { equals: proj.projectId } }, overrideAccess: true })).totalDocs === 1)

  // 5) Palettes (3, deterministic)
  const pal = await makePalettes(proj.projectId, { temperature: 'warm', interiorExterior: 'interior', preferredFinish: 'matt' })
  check('three palettes generated (safe/balanced/bold)', pal.palettes.length === 3 && pal.palettes.map((p) => p.key).join() === 'safe,balanced,bold')
  check('each palette has main/accent/trim roles', pal.palettes.every((p) => p.roles.length === 3))

  // 6) Variant — mocked provider success
  const good = await makeVariant({ spaceId, paletteId: pal.palettes[0].id, surfaces: [{ type: 'wall', confirmedByUser: true }], disclaimerAccepted: true, sessionId: 'ZZS', clientId: 'ZZIP', providers: { primary: okImg('openai', png), backup: okImg('gemini', png) } })
  check('variant generated with mocked provider', good.ok === true)
  // Variant — no providers configured -> preserve project + human assistance
  const none = await makeVariant({ spaceId, paletteId: pal.palettes[0].id, surfaces: [{ type: 'wall', confirmedByUser: true }], disclaimerAccepted: true, sessionId: 'ZZS2', clientId: 'ZZIP', providers: { primary: null, backup: null } })
  check('no provider -> human assistance, project preserved', none.ok === false && none.humanAssistance === true)

  // 7) Convert to plan (deterministic calculator; never from photo)
  const plan = await convertToPlan({ projectId: proj.projectId, spaceId, paletteId: pal.palettes[0].id, rooms: [{ length: 4, width: 3, height: 2.7, doors: 1, windows: 1, includeCeiling: true }], coats: 2, wastePct: 10 })
  check('convert to plan runs deterministic calc', plan.ok === true && Array.isArray(plan.calc.components) && plan.calc.components.length === 1)

  // 8) Lead — consent gating
  const noConsent = await saveDesignLead({ projectId: proj.projectId, name: 'ZZ Cust', phone: '+255700000030', consent: false })
  check('lead blocked without consent', noConsent.ok === false && noConsent.error === 'consent_required')
  const lead = await saveDesignLead({ projectId: proj.projectId, name: 'ZZ Cust', phone: '+255700000030', budget: '1-2m', timeline: 'this month', consent: true })
  check('lead saved with consent + reference', lead.ok === true && lead.ok && !!lead.reference)
  const leadCount = (await payload.find({ collection: 'leads', where: { name: { like: 'ZZ Cust' } }, overrideAccess: true })).totalDocs
  check('quote-ready lead persisted (source design)', leadCount >= 1)

  // 9) Resume + delete
  const state = await loadProjectState(proj.projectId)
  check('project state loads for resume', state.ok === true && state.ok && state.palettes.length === 3)
  const del = await removeDesignProject(proj.projectId)
  check('project + assets deleted', del.deleted.project === 1)
  const gone = (await payload.find({ collection: 'design-projects', where: { name: { like: 'ZZSTUDIO' } }, overrideAccess: true })).totalDocs === 0

  // cleanup leftover leads
  const leads = await payload.find({ collection: 'leads', where: { name: { like: 'ZZ Cust' } }, overrideAccess: true, limit: 50 })
  for (const l of leads.docs) await payload.delete({ collection: 'leads', id: l.id, overrideAccess: true })
  check('project fully removed', gone)

  console.log(`\n${fail === 0 ? 'ALL DESIGN STUDIO FLOW TESTS PASSED ✓' : fail + ' FAILED ✗'} (${pass} passed, ${fail} failed)`)
  process.exit(fail === 0 ? 0 : 1)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
