//@ts-check

import { composePlugins, withNx } from '@nx/next'

/** @type {import('next').NextConfig} */
const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
      },
    ],
  },
  transpilePackages: ["geist"],
}

const plugins = [
  withNx,
]

export default composePlugins(...plugins)(nextConfig)
