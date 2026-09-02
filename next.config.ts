import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Cache Components: habilita `'use cache'` + `cacheLife` (Plan 01 B1.1).
  cacheComponents: true,
}

export default nextConfig
