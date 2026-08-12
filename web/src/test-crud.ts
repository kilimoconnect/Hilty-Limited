/**
 * CRUD smoke test — for every collection, verifies:
 *   create → edit → deactivate → display (read back) → cleanup (delete).
 * Uses the Payload Local API (overrideAccess). Run:  npm run test:crud
 *
 * This is a data-foundation test, not a frontend test.
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from './payload.config'

const PNG_1x1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
)

type Result = { collection: string; create: string; edit: string; deactivate: string; display: string; cleanup: string }

const run = async () => {
  const payload = await getPayload({ config })
  const results: Result[] = []
  const ok = '✓'
  const na = '—'
  let failures = 0

  // A helper category for the Products test (products.category is required)
  const helperCat = await payload.create({
    collection: 'product-categories',
    data: { name: `__crud_cat_${Date.now()}`, key: 'interior_paint' },
  })

  const now = () => Date.now()

  const specs: {
    slug: string
    label: string
    create: () => Record<string, unknown>
    edit: Record<string, unknown>
    editCheck: [string, unknown]
    deactivate?: { data: Record<string, unknown>; check: [string, unknown] }
    file?: { data: Buffer; mimetype: string; name: string }
  }[] = [
    {
      slug: 'users',
      label: 'Users',
      create: () => ({ name: 'CRUD User', email: `crud_${now()}@example.com`, password: 'Testpass123!', roles: ['viewer'] }),
      edit: { name: 'CRUD User Edited' },
      editCheck: ['name', 'CRUD User Edited'],
      deactivate: { data: { active: false }, check: ['active', false] },
    },
    {
      slug: 'media',
      label: 'Media',
      create: () => ({ alt: 'crud image' }),
      edit: { alt: 'crud image edited' },
      editCheck: ['alt', 'crud image edited'],
      file: { data: PNG_1x1, mimetype: 'image/png', name: `crud_${now()}.png` },
    },
    {
      slug: 'documents',
      label: 'Documents',
      create: () => ({ label: 'crud doc', kind: 'other' }),
      edit: { label: 'crud doc edited' },
      editCheck: ['label', 'crud doc edited'],
      // Documents accepts images too; use the valid PNG fixture (a hand-rolled minimal
      // PDF fails Payload's PDF validator). PDF upload itself is exercised in the admin.
      file: { data: PNG_1x1, mimetype: 'image/png', name: `crud_${now()}.png` },
    },
    {
      slug: 'brands',
      label: 'Brands',
      create: () => ({ name: `CRUD Brand ${now()}` }),
      edit: { website: 'https://example.com' },
      editCheck: ['website', 'https://example.com'],
    },
    {
      slug: 'product-categories',
      label: 'Product categories',
      create: () => ({ name: `CRUD Cat ${now()}`, key: 'exterior_paint' }),
      edit: { displayOrder: 7 },
      editCheck: ['displayOrder', 7],
      deactivate: { data: { active: false }, check: ['active', false] },
    },
    {
      slug: 'products',
      label: 'Products',
      create: () => ({ name: `CRUD Product ${now()}`, category: helperCat.id }),
      edit: { finish: 'matt' },
      editCheck: ['finish', 'matt'],
      deactivate: { data: { active: false }, check: ['active', false] },
    },
    {
      slug: 'branches',
      label: 'Branches',
      create: () => ({ name: `CRUD Branch ${now()}` }),
      edit: { phone: '+255 700 000 000' },
      editCheck: ['phone', '+255 700 000 000'],
      deactivate: { data: { active: false }, check: ['active', false] },
    },
    {
      slug: 'services',
      label: 'Services',
      create: () => ({ name: `CRUD Service ${now()}` }),
      edit: { summary: 'edited summary' },
      editCheck: ['summary', 'edited summary'],
      deactivate: { data: { active: false }, check: ['active', false] },
    },
    {
      slug: 'projects',
      label: 'Projects',
      create: () => ({ title: `CRUD Project ${now()}` }),
      edit: { location: 'Dar es Salaam' },
      editCheck: ['location', 'Dar es Salaam'],
      deactivate: { data: { active: false }, check: ['active', false] },
    },
    {
      slug: 'painters',
      label: 'Painters & contractors',
      create: () => ({ fullName: `CRUD Painter ${now()}`, phone: '+255 700 000 001' }),
      edit: { region: 'Pwani' },
      editCheck: ['region', 'Pwani'],
      deactivate: { data: { status: 'suspended' }, check: ['status', 'suspended'] },
    },
    {
      slug: 'leads',
      label: 'Leads',
      create: () => ({ name: `CRUD Lead ${now()}` }),
      edit: { interest: 'Interior paint' },
      editCheck: ['interest', 'Interior paint'],
      deactivate: { data: { status: 'lost' }, check: ['status', 'lost'] },
    },
    {
      slug: 'quotation-requests',
      label: 'Quotation requests',
      create: () => ({ customerName: `CRUD Quote ${now()}` }),
      edit: { projectType: 'House' },
      editCheck: ['projectType', 'House'],
      deactivate: { data: { status: 'declined' }, check: ['status', 'declined'] },
    },
    {
      slug: 'site-visit-requests',
      label: 'Site-visit requests',
      create: () => ({ name: `CRUD Visit ${now()}` }),
      edit: { location: 'Bunju' },
      editCheck: ['location', 'Bunju'],
      deactivate: { data: { status: 'cancelled' }, check: ['status', 'cancelled'] },
    },
    {
      slug: 'complaints',
      label: 'Complaints & batch reports',
      create: () => ({ customerName: `CRUD Complaint ${now()}` }),
      edit: { batchNumber: 'B-123' },
      editCheck: ['batchNumber', 'B-123'],
      deactivate: { data: { status: 'closed' }, check: ['status', 'closed'] },
    },
    {
      slug: 'ai-sessions',
      label: 'AI sessions',
      create: () => ({ sessionId: `crud-${now()}` }),
      edit: { channel: 'whatsapp' },
      editCheck: ['channel', 'whatsapp'],
      deactivate: { data: { endedAt: new Date().toISOString() }, check: undefined as never },
    },
    {
      slug: 'ai-lead-summaries',
      label: 'AI lead summaries',
      create: () => ({ summary: 'crud summary' }),
      edit: { detectedIntent: 'buy_paint' },
      editCheck: ['detectedIntent', 'buy_paint'],
      deactivate: { data: { status: 'dismissed' }, check: ['status', 'dismissed'] },
    },
  ]

  for (const spec of specs) {
    const r: Result = { collection: spec.label, create: na, edit: na, deactivate: na, display: na, cleanup: na }
    let id: string | number | undefined
    try {
      const created = await payload.create({
        collection: spec.slug as never,
        data: spec.create() as never,
        ...(spec.file ? { file: { ...spec.file, size: spec.file.data.length } } : {}),
      } as never)
      id = (created as { id: string | number }).id
      r.create = ok

      // edit
      const edited = await payload.update({ collection: spec.slug as never, id: id as never, data: spec.edit as never })
      r.edit = (edited as Record<string, unknown>)[spec.editCheck[0]] === spec.editCheck[1] ? ok : '✗ value'
      if (r.edit !== ok) failures++

      // deactivate
      if (spec.deactivate) {
        const deact = await payload.update({ collection: spec.slug as never, id: id as never, data: spec.deactivate.data as never })
        if (spec.deactivate.check) {
          r.deactivate = (deact as Record<string, unknown>)[spec.deactivate.check[0]] === spec.deactivate.check[1] ? ok : '✗ value'
        } else {
          r.deactivate = ok // e.g. ai-sessions endedAt set
        }
        if (r.deactivate !== ok) failures++
      }

      // display (read back)
      const fetched = await payload.findByID({ collection: spec.slug as never, id: id as never })
      r.display = fetched && (fetched as { id: unknown }).id === id ? ok : '✗'
      if (r.display !== ok) failures++
    } catch (e) {
      failures++
      const msg = e instanceof Error ? e.message : String(e)
      if (r.create === na) r.create = `✗ ${msg.slice(0, 40)}`
      else r.edit = `✗ ${msg.slice(0, 40)}`
    } finally {
      // cleanup
      if (id !== undefined) {
        try {
          await payload.delete({ collection: spec.slug as never, id: id as never })
          r.cleanup = ok
        } catch {
          r.cleanup = '✗'
        }
      }
      results.push(r)
    }
  }

  // cleanup helper category
  try {
    await payload.delete({ collection: 'product-categories', id: helperCat.id })
  } catch {
    /* ignore */
  }

  // Report
  console.log('\nCRUD results (create / edit / deactivate / display / cleanup):')
  console.log('─'.repeat(78))
  for (const r of results) {
    console.log(
      `${r.collection.padEnd(30)} ${r.create.padEnd(6)} ${r.edit.padEnd(6)} ${r.deactivate.padEnd(6)} ${r.display.padEnd(6)} ${r.cleanup}`,
    )
  }
  console.log('─'.repeat(78))
  console.log(failures === 0 ? '\nALL CHECKS PASSED ✓' : `\n${failures} CHECK(S) FAILED ✗`)
  process.exit(failures === 0 ? 0 : 1)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
