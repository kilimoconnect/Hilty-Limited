import type { MetadataRoute } from 'next'

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://hilty.co.tz').replace(/\/$/, '')

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/ops', '/api'] }],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  }
}
