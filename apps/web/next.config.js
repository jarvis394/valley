//@ts-check

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
  output: 'standalone',
}

module.exports = nextConfig
