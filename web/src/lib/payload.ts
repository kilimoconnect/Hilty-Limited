import { getPayload } from 'payload'
import config from '@payload-config'
import type { Branch, Product, ProductCategory, Project, Service } from '../payload-types'
import { relName } from './format'

/** Minimal, serialisable product shape for the client-side calculator. */
export type CalcProduct = {
  id: number
  name: string
  brand?: string
  finish?: string | null
  coverage: number | null // only present when coverage is VERIFIED
  coverageVerified: boolean
  recommendedCoats: number | null
  packSizes: number[]
  useTypes: string[]
}

/** Quotation-eligible, active products. Coverage is exposed ONLY when verified. */
export async function getCalculatorProducts(): Promise<CalcProduct[]> {
  const p = await getClient()
  const res = await p.find({
    collection: 'products',
    where: { and: [{ active: { equals: true } }, { quotationEligible: { equals: true } }] },
    limit: 200,
    depth: 1,
    overrideAccess: true,
  })
  return res.docs.map((d) => {
    const cov = typeof d.coveragePerLitre === 'number' ? d.coveragePerLitre : 0
    const verified = d.verification?.status === 'verified' && cov > 0
    return {
      id: d.id,
      name: d.name,
      brand: relName(d.brand) || undefined,
      finish: d.finish ?? null,
      coverage: verified ? cov : null,
      coverageVerified: verified,
      recommendedCoats: typeof d.recommendedCoats === 'number' ? d.recommendedCoats : null,
      packSizes: (d.packSizes ?? [])
        .map((x) => x.litres)
        .filter((n): n is number => typeof n === 'number' && n > 0),
      useTypes: (d.useTypes ?? []) as string[],
    }
  })
}

export async function getClient() {
  return getPayload({ config })
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const p = await getClient()
  const res = await p.find({
    collection: 'products',
    where: { and: [{ active: { equals: true } }, { featured: { equals: true } }] },
    limit,
    depth: 1,
    overrideAccess: true,
  })
  return res.docs
}

export async function getCategories(limit = 12): Promise<ProductCategory[]> {
  const p = await getClient()
  const res = await p.find({
    collection: 'product-categories',
    where: { active: { equals: true } },
    sort: 'displayOrder',
    limit,
    depth: 1,
    overrideAccess: true,
  })
  return res.docs
}

export async function getActiveServices(limit = 6): Promise<Service[]> {
  const p = await getClient()
  const res = await p.find({
    collection: 'services',
    where: { active: { equals: true } },
    sort: 'displayOrder',
    limit,
    depth: 1,
    overrideAccess: true,
  })
  return res.docs
}

export async function getActiveBranches(limit = 6): Promise<Branch[]> {
  const p = await getClient()
  const res = await p.find({
    collection: 'branches',
    where: { active: { equals: true } },
    limit,
    depth: 0,
    overrideAccess: true,
  })
  return res.docs
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const p = await getClient()
  const res = await p.find({
    collection: 'services',
    where: { and: [{ slug: { equals: slug } }, { active: { equals: true } }] },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })
  return res.docs[0] ?? null
}

export async function getBranchBySlug(slug: string): Promise<Branch | null> {
  const p = await getClient()
  const res = await p.find({
    collection: 'branches',
    where: { and: [{ slug: { equals: slug } }, { active: { equals: true } }] },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })
  return res.docs[0] ?? null
}

/** Completed projects — only real, active, published ones (never fabricated). */
export async function getCompletedProjects(limit = 3): Promise<Project[]> {
  const p = await getClient()
  const res = await p.find({
    collection: 'projects',
    where: { active: { equals: true } },
    limit,
    depth: 1,
    overrideAccess: true,
  })
  return res.docs
}
