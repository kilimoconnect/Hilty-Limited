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

// Canonical painting-service pages. Factual, Hilty-specific, NO unverified guarantees/warranties.
type SeedService = {
  name: string
  summary: string
  heroIntro: string
  sectors: ('residential' | 'commercial')[]
  scope: string[]
  process: { title: string; detail: string }[]
  customerProvides: string[]
  hiltyConfirms: string[]
}

const commonProcess = [
  { title: 'Enquiry', detail: 'You share your project details and request a site visit.' },
  { title: 'Site inspection', detail: 'Our team inspects the surfaces and measures the area.' },
  { title: 'Recommendation & quotation', detail: 'We recommend the paint system and provide a written quotation.' },
  { title: 'Preparation & painting', detail: 'Surfaces are prepared and painted by our team.' },
  { title: 'Handover', detail: 'We review the finished work with you at handover.' },
]
const commonConfirms = [
  'Surface condition and any repairs needed',
  'Correct paint system, primer and number of coats',
  'Approximate paint and material quantities (m² and litres)',
  'Access, timeline and site requirements',
]

const SITE_SERVICES: SeedService[] = [
  {
    name: 'Residential painting',
    summary: 'Interior and exterior painting for homes and apartments.',
    heroIntro: 'Professional painting for houses and apartments, from single rooms to whole-home repaints.',
    sectors: ['residential'],
    scope: ['Interior and exterior walls', 'Ceilings, doors and trim', 'Minor surface repairs before painting'],
    process: commonProcess,
    customerProvides: ['Access to the property', 'Preferred colours or a request for colour guidance', 'Any known moisture or damp issues'],
    hiltyConfirms: commonConfirms,
  },
  {
    name: 'Commercial painting',
    summary: 'Painting for offices, retail, hospitality and larger buildings.',
    heroIntro: 'Reliable painting for commercial premises, planned around your operating hours.',
    sectors: ['commercial'],
    scope: ['Interior and exterior commercial surfaces', 'Common areas and facades', 'Scheduling around business operations'],
    process: commonProcess,
    customerProvides: ['Site access and working hours', 'Any facility / safety requirements', 'Scope and areas to be painted'],
    hiltyConfirms: [...commonConfirms, 'Health-and-safety and access arrangements on site'],
  },
  {
    name: 'Interior painting',
    summary: 'Interior walls, ceilings and trim with a clean finish.',
    heroIntro: 'Interior repaints with careful preparation and tidy, protected work areas.',
    sectors: ['residential', 'commercial'],
    scope: ['Interior walls and ceilings', 'Doors, frames and skirting', 'Protection of floors and furniture'],
    process: commonProcess,
    customerProvides: ['Access to the rooms', 'Preferred colours or finish', 'Furniture moved or ready to be protected'],
    hiltyConfirms: commonConfirms,
  },
  {
    name: 'Exterior painting',
    summary: 'Exterior walls and facades prepared for local weather conditions.',
    heroIntro: 'Exterior painting with the right preparation and coatings for Tanzanian weather.',
    sectors: ['residential', 'commercial'],
    scope: ['Exterior walls and facades', 'Cleaning and preparation of surfaces', 'Weather-appropriate coating systems'],
    process: commonProcess,
    customerProvides: ['Access around the building', 'Any known cracks or water damage', 'Preferred colours or a request for guidance'],
    hiltyConfirms: [...commonConfirms, 'Weather considerations and suitable coating system'],
  },
  {
    name: 'Surface preparation',
    summary: 'Cleaning, sanding, filling and priming before painting.',
    heroIntro: 'Proper surface preparation for a durable, even paint finish.',
    sectors: ['residential', 'commercial'],
    scope: ['Cleaning and sanding', 'Filling and making good', 'Priming and undercoating'],
    process: commonProcess,
    customerProvides: ['Access to the surfaces', 'Details of previous coatings if known', 'Any damp or structural concerns'],
    hiltyConfirms: ['Extent of preparation and repairs required', 'Correct primer/undercoat for the surface', 'Readiness of the surface for topcoats'],
  },
  {
    name: 'Site inspection & colour consultation',
    summary: 'On-site inspection and guidance on colours and paint systems.',
    heroIntro: 'A site visit to inspect surfaces, discuss colours and recommend the right paint system.',
    sectors: ['residential', 'commercial'],
    scope: ['On-site surface inspection', 'Colour and finish guidance', 'Written recommendation and quotation'],
    process: [
      { title: 'Book a visit', detail: 'Request a site visit at a time that suits you.' },
      { title: 'Inspection', detail: 'We inspect surfaces and take measurements.' },
      { title: 'Guidance', detail: 'We discuss colours and the recommended paint system.' },
      { title: 'Quotation', detail: 'We provide a written recommendation and quotation.' },
    ],
    customerProvides: ['Access to the property', 'Any ideas, references or preferred colours'],
    hiltyConfirms: [...commonConfirms, 'Indicative colour direction (final colour confirmed on samples)'],
  },
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
          heroIntro: s.heroIntro,
          sectors: s.sectors,
          scope: s.scope.map((item) => ({ item })),
          process: s.process,
          customerProvides: s.customerProvides.map((item) => ({ item })),
          hiltyConfirms: s.hiltyConfirms.map((item) => ({ item })),
          displayOrder: i,
          active: true,
          verification: {
            status: 'pending_review',
            notes: 'Draft service content — confirm scope/process wording. No warranty/guarantee is stated; keep it that way unless officially confirmed.',
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
