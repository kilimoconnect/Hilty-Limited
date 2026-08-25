import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  // Frontend is intentionally minimal in this portion (data foundation only).
}

export default withPayload(nextConfig)

// Deployment trigger: build from web/ root on Vercel (Root Directory = web).
