import type { MetadataRoute } from 'next'
import { getClient } from '../lib/payload'

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://hilty.co.tz').replace(/\/$/, '')
export const dynamic = 'force-dynamic'
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ['', '/products', '/paint-calculator', '/painting-services', '/projects', '/painters-contractors', '/branches', '/about', '/kibaba-cooking-oil', '/request-quotation', '/design-studio', '/ai-advisor']
  const entries: MetadataRoute.Sitemap = staticPaths.map((p) => ({ url: `${BASE}${p}`, changeFrequency: 'weekly', priority: p === '' ? 1 : 0.7 }))

  try {
    const payload = await getClient()
    const [products, branches, services] = await Promise.all([
      payload.find({ collection: 'products', where: { active: { equals: true } }, limit: 500, depth: 0, overrideAccess: true }),
      payload.find({ collection: 'branches', where: { active: { equals: true } }, limit: 100, depth: 0, overrideAccess: true }),
      payload.find({ collection: 'services', where: { active: { equals: true } }, limit: 100, depth: 0, overrideAccess: true }),
    ])
    for (const d of products.docs) if (d.slug) entries.push({ url: `${BASE}/products/${d.slug}`, changeFrequency: 'weekly', priority: 0.6 })
    for (const d of branches.docs) if (d.slug) entries.push({ url: `${BASE}/branches/${d.slug}`, changeFrequency: 'monthly', priority: 0.6 })
    for (const d of services.docs) if (d.slug) entries.push({ url: `${BASE}/painting-services/${d.slug}`, changeFrequency: 'monthly', priority: 0.6 })
  } catch {
    // DB unavailable — return the static routes only.
  }
  return entries
}
