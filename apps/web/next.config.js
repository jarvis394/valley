//@ts-check

const dotenv = require('@dotenvx/dotenvx')
const path = require('path')

dotenv.config({ path: path.join(__dirname, '../../.env') })

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // TODO: remove this, testing only
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
      },
    ],
  },
  transpilePackages: ['geist', '@valley/ui'],
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
  experimental: {
    optimizePackageImports: ['geist-ui-icons'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_TUSD_URL: process.env.NEXT_PUBLIC_TUSD_URL,
  },
  output: 'standalone',
}

module.exports = nextConfig
