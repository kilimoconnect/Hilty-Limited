import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Redirect old WordPress URLs to the correct new pages (SEO continuity).
  async redirects() {
    return [
      { source: '/services', destination: '/painting-services', permanent: true },
      { source: '/paints-colors', destination: '/products', permanent: true },
      { source: '/contacts', destination: '/branches', permanent: true },
      { source: '/shop', destination: '/products', permanent: true },
      { source: '/cart', destination: '/request-quotation', permanent: true },
      { source: '/checkout', destination: '/request-quotation', permanent: true },
      { source: '/my-account', destination: '/', permanent: true },
    ]
  },
  // Security + caching headers.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
      {
        // Long-cache immutable static assets.
        source: '/icons/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },
}

export default withPayload(nextConfig)
