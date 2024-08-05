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
    ],
  },
  transpilePackages: ['geist', '@valley/ui'],
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
}

module.exports = nextConfig
