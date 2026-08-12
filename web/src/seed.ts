/**
 * Seed script — migrates ONLY verified content observed on the existing site,
 * plus the structural category taxonomy and the first admin user.
 *
 * Does NOT create products, projects, painters, leads or any fabricated data.
 * Run:  npm run seed
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from './payload.config'
import { CATEGORY_KEYS } from './collections/ProductCategories'

type Day = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
const HILTY_HOURS: { day: Day; open: string; close: string; closed: boolean }[] = [
  { day: 'monday', open: '08:30', close: '18:00', closed: false },
  { day: 'tuesday', open: '08:30', close: '18:00', closed: false },
  { day: 'wednesday', open: '08:30', close: '18:00', closed: false },
  { day: 'thursday', open: '08:30', close: '18:00', closed: false },
  { day: 'friday', open: '08:30', close: '18:00', closed: false },
  { day: 'saturday', open: '08:30', close: '17:30', closed: false },
  { day: 'sunday', open: '', close: '', closed: true },
]

// Branches AS LISTED ON THE LIVE SITE (Contacts page). NOTE: the owner brief says
// "Goba" where the site says "Mapinga" — flagged for confirmation, left editable.
const SITE_BRANCHES = [
  { name: 'Bunju B', district: 'Kinondoni', region: 'Dar es Salaam' },
  { name: 'Mapinga', district: 'Bagamoyo', region: 'Pwani' },
  { name: 'Kibaha Maili Moja', district: 'Kibaha', region: 'Pwani' },
]

// Services AS LISTED ON THE LIVE SITE. Warranty/"Platinum plan" wording is UNVERIFIED.
const SITE_SERVICES = [
  { name: 'Paint sales & supply', summary: 'Selling of all types of paint colours and painting products.' },
  { name: 'House painting (interior & exterior)', summary: 'Professional residential and commercial painting.' },
  { name: 'Spray painting', summary: 'Spray application for a smooth, even finish.' },
  { name: 'Mechanized sanding', summary: 'Machine surface preparation before painting.' },
  { name: 'Colour consultancy', summary: 'Guidance on colour selection using visual tools.' },
]

async function findFirst(payload: Awaited<ReturnType<typeof getPayload>>, collection: string, where: object) {
  const res = await payload.find({ collection: collection as never, where: where as never, limit: 1 })
  return res.docs[0]
}

const run = async () => {
  const payload = await getPayload({ config })
  const log = (m: string) => payload.logger.info(`[seed] ${m}`)

  // 1) First admin user
  const existingUsers = await payload.find({ collection: 'users', limit: 1 })
  if (existingUsers.totalDocs === 0) {
    const email = process.env.PAYLOAD_ADMIN_EMAIL
    const password = process.env.PAYLOAD_ADMIN_PASSWORD
    if (!email || !password) {
      throw new Error('Set PAYLOAD_ADMIN_EMAIL and PAYLOAD_ADMIN_PASSWORD in .env to seed the admin user.')
    }
    await payload.create({
      collection: 'users',
      data: { name: 'Hilty Admin', email, password, roles: ['admin'], active: true },
    })
    log(`created admin user ${email}`)
  } else {
    log('admin user already exists — skipping')
  }

  // 2) Product categories (structural taxonomy — not fabricated products)
  for (let i = 0; i < CATEGORY_KEYS.length; i++) {
    const c = CATEGORY_KEYS[i]
    const existing = await findFirst(payload, 'product-categories', { key: { equals: c.value } })
    if (!existing) {
      await payload.create({
        collection: 'product-categories',
        data: { name: c.label, key: c.value, displayOrder: i, active: true },
      })
      log(`category: ${c.label}`)
    }
  }

  // 3) Plascon brand (anchor; Hilty is an authorised retailer/supplier, not the manufacturer)
  if (!(await findFirst(payload, 'brands', { name: { equals: 'Plascon' } }))) {
    await payload.create({
      collection: 'brands',
      data: {
        name: 'Plascon',
        isAuthorisedDealerBrand: true,
        notes: 'Anchor paint brand. Hilty is a retailer/supplier — NOT the manufacturer, and does not own Plascon products/colours/IP.',
      },
    })
    log('brand: Plascon')
  }

  // 4) Branches (from live site; Goba-vs-Mapinga discrepancy flagged, kept editable)
  for (const b of SITE_BRANCHES) {
    if (!(await findFirst(payload, 'branches', { name: { equals: b.name } }))) {
      await payload.create({
        collection: 'branches',
        data: {
          name: b.name,
          region: b.region,
          district: b.district,
          fullAddress: `${b.name}, P.O. Box 6026, Dar es Salaam – Tanzania`,
          phone: '+255 757 327 708',
          whatsapp: '+255 757 327 708',
          email: 'info@hilty.co.tz',
          operatingHours: HILTY_HOURS,
          active: true,
          verification: {
            status: 'pending_review',
            notes: 'Migrated from existing site. Owner brief lists "Goba" instead of "Mapinga" — confirm the correct outlets, exact addresses and pins.',
          },
        },
      })
      log(`branch: ${b.name}`)
    }
  }

  // 5) Services (from live site; warranty/Platinum-plan wording unverified)
  for (let i = 0; i < SITE_SERVICES.length; i++) {
    const s = SITE_SERVICES[i]
    if (!(await findFirst(payload, 'services', { name: { equals: s.name } }))) {
      await payload.create({
        collection: 'services',
        data: {
          name: s.name,
          summary: s.summary,
          displayOrder: i,
          active: true,
          verification: {
            status: 'pending_review',
            notes: 'Migrated from existing site. Reword to avoid implying Hilty manufactures paint; confirm any warranty/"Platinum plan" and colour-count claims (site shows both "over 2,000" and "2,200+").',
          },
        },
      })
      log(`service: ${s.name}`)
    }
  }

  log('done.')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
