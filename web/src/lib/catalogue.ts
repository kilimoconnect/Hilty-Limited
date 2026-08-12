import type { PaginatedDocs, Where } from 'payload'
import type { Brand, Product } from '../payload-types'
import { getClient } from './payload'

export const PAGE_SIZE = 12

export const FINISH_OPTIONS = [
  { label: 'Matt', value: 'matt' },
  { label: 'Silk / eggshell', value: 'silk' },
  { label: 'Satin', value: 'satin' },
  { label: 'Semi-gloss', value: 'semi_gloss' },
  { label: 'Gloss', value: 'gloss' },
  { label: 'Textured', value: 'textured' },
  { label: 'Other', value: 'other' },
]

export const USE_OPTIONS = [
  { label: 'Interior', value: 'interior' },
  { label: 'Exterior', value: 'exterior' },
  { label: 'Roof', value: 'roof' },
  { label: 'Wood', value: 'wood' },
  { label: 'Metal', value: 'metal' },
]

export const PACK_OPTIONS = [1, 4, 5, 10, 20]

export type ProductFilters = {
  q?: string
  category?: string
  brand?: string
  use?: string
  surface?: string
  finish?: string
  pack?: string
  page?: number
}

/** True when any filter/search is active (used to decide whether to show featured/popular). */
export const hasActiveFilters = (f: ProductFilters): boolean =>
  Boolean(f.q || f.category || f.brand || f.use || f.surface || f.finish || f.pack)

export async function getBrands(): Promise<Brand[]> {
  const p = await getClient()
  const res = await p.find({ collection: 'brands', limit: 100, sort: 'name', overrideAccess: true })
  return res.docs
}

export async function queryProducts(f: ProductFilters): Promise<PaginatedDocs<Product>> {
  const p = await getClient()
  const and: Where[] = [{ active: { equals: true } }]

  if (f.category) {
    const cat = await p.find({
      collection: 'product-categories',
      where: { slug: { equals: f.category } },
      limit: 1,
      overrideAccess: true,
    })
    and.push(cat.docs[0] ? { category: { equals: cat.docs[0].id } } : { id: { equals: 0 } })
  }
  if (f.brand) {
    const br = await p.find({
      collection: 'brands',
      where: { slug: { equals: f.brand } },
      limit: 1,
      overrideAccess: true,
    })
    and.push(br.docs[0] ? { brand: { equals: br.docs[0].id } } : { id: { equals: 0 } })
  }
  if (f.use) and.push({ useTypes: { in: [f.use] } })
  if (f.finish) and.push({ finish: { equals: f.finish } })
  if (f.surface) and.push({ 'surfaceCompatibility.surface': { like: f.surface } })
  if (f.pack && !Number.isNaN(Number(f.pack))) and.push({ 'packSizes.litres': { equals: Number(f.pack) } })
  if (f.q) {
    and.push({
      or: [
        { name: { like: f.q } },
        { colourAvailability: { like: f.q } },
        { 'surfaceCompatibility.surface': { like: f.q } },
      ],
    })
  }

  const page = Math.max(1, f.page ?? 1)
  return p.find({
    collection: 'products',
    where: { and },
    limit: PAGE_SIZE,
    page,
    sort: 'name',
    depth: 1,
    overrideAccess: true,
  })
}

export async function getPopularProducts(limit = 6): Promise<Product[]> {
  const p = await getClient()
  const res = await p.find({
    collection: 'products',
    where: { and: [{ active: { equals: true } }, { popular: { equals: true } }] },
    limit,
    depth: 1,
    overrideAccess: true,
  })
  return res.docs
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const p = await getClient()
  const res = await p.find({
    collection: 'products',
    where: { and: [{ slug: { equals: slug } }, { active: { equals: true } }] },
    limit: 1,
    depth: 2,
    overrideAccess: true,
  })
  return res.docs[0] ?? null
}

/** Decide whether a verified public price can be shown; otherwise "Request current price". */
export function publicPrice(product: Product): { amount: number; currency: string } | null {
  const pr = product.pricing
  if (pr && pr.showPricePublicly && pr.priceVerified && typeof pr.price === 'number') {
    return { amount: pr.price, currency: pr.currency ?? 'TZS' }
  }
  return null
}
