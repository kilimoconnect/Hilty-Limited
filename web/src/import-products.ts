/**
 * CSV catalogue import. Upserts products from a CSV that follows
 * import-templates/products-template.csv.
 *
 *   npm run import:products -- ./import-templates/sample-products.csv
 *
 * Rules honoured: prices stay private unless show_price_publicly=true AND price_verified=true;
 * technical info stays unverified unless the CSV says otherwise; no data is fabricated here —
 * it only loads what the CSV provides.
 */
import 'dotenv/config'
import { readFileSync } from 'fs'
import { parse } from 'csv-parse/sync'
import { getPayload } from 'payload'
import config from './payload.config'

const bool = (v: string | undefined) => ['true', '1', 'yes', 'y'].includes((v ?? '').trim().toLowerCase())
const num = (v: string | undefined) => {
  const n = Number((v ?? '').trim())
  return Number.isFinite(n) && v?.trim() ? n : undefined
}
const list = (v: string | undefined, sep = ';') =>
  (v ?? '')
    .split(sep)
    .map((s) => s.trim())
    .filter(Boolean)

async function run() {
  const file = process.argv[2]
  if (!file) {
    console.error('Usage: npm run import:products -- <path-to-csv>')
    process.exit(1)
  }
  const rows = parse(readFileSync(file), { columns: true, skip_empty_lines: true, trim: true }) as Record<string, string>[]
  const payload = await getPayload({ config })
  let created = 0
  let updated = 0
  let skipped = 0

  for (const row of rows) {
    const name = row.name?.trim()
    if (!name) {
      skipped++
      continue
    }

    // Category (must exist — seeded taxonomy)
    const catKey = row.category_key?.trim()
    const catRes = await payload.find({ collection: 'product-categories', where: { key: { equals: catKey } }, limit: 1 })
    const category = catRes.docs[0]
    if (!category) {
      console.warn(`  ! skip "${name}": unknown category_key "${catKey}"`)
      skipped++
      continue
    }

    // Brand (create if missing)
    let brandId: number | undefined
    const brandName = row.brand?.trim()
    if (brandName) {
      const b = await payload.find({ collection: 'brands', where: { name: { equals: brandName } }, limit: 1 })
      brandId = b.docs[0]?.id ?? (await payload.create({ collection: 'brands', data: { name: brandName } })).id
    }

    const data: Record<string, unknown> = {
      name,
      category: category.id,
      brand: brandId,
      useTypes: list(row.use_types, '|'),
      finish: row.finish?.trim() || undefined,
      surfaceCompatibility: list(row.surface_compatibility).map((surface) => ({ surface })),
      colourAvailability: row.colour_availability || undefined,
      coveragePerLitre: num(row.coverage_per_litre),
      recommendedCoats: num(row.recommended_coats),
      recommendedPrimer: row.recommended_primer || undefined,
      recommendedUndercoat: row.recommended_undercoat || undefined,
      recommendedTopcoat: row.recommended_topcoat || undefined,
      dryingTime: { touchDry: row.drying_touch_dry || undefined, recoat: row.drying_recoat || undefined },
      packSizes: list(row.pack_sizes_litres).map((l) => ({ litres: Number(l) })).filter((p) => Number.isFinite(p.litres)),
      tdsUrl: row.tds_url || undefined,
      technicalSource: row.technical_source || undefined,
      featured: bool(row.featured),
      popular: bool(row.popular),
      active: row.active === undefined ? true : bool(row.active),
      quotationEligible: row.quotation_eligible === undefined ? true : bool(row.quotation_eligible),
      pricing: {
        price: num(row.price),
        currency: row.currency?.trim() || 'TZS',
        priceVerified: bool(row.price_verified),
        // Never public unless BOTH verified and explicitly enabled.
        showPricePublicly: bool(row.show_price_publicly) && bool(row.price_verified),
      },
      verification: { status: row.verification_status?.trim() || 'unverified' },
    }

    const existing = await payload.find({ collection: 'products', where: { name: { equals: name } }, limit: 1 })
    if (existing.docs[0]) {
      await payload.update({ collection: 'products', id: existing.docs[0].id, data: data as never })
      updated++
      console.log(`  ~ updated: ${name}`)
    } else {
      await payload.create({ collection: 'products', data: data as never })
      created++
      console.log(`  + created: ${name}`)
    }
  }

  console.log(`\nImport complete — created ${created}, updated ${updated}, skipped ${skipped}.`)
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
