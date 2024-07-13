//@ts-check

import { composePlugins, withNx } from '@nx/next'

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
}

const plugins = [
  withNx,
]

export default composePlugins(...plugins)(nextConfig)
