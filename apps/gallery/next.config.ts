import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['geist', '@valley/ui'],
  output: 'standalone',
}

export default nextConfig
