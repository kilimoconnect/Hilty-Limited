import { getPayload } from 'payload'
import config from '@payload-config'
import type { Branch, Product, ProductCategory, Project, Service } from '../payload-types'

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
