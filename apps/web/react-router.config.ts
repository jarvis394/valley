import type { Config } from '@react-router/dev/config'
import { vercelPreset } from '@vercel/remix/vite'

const isVercel = process.env.VERCEL === '1'

export default {
  ssr: true,
  future: {
    unstable_splitRouteModules: true,
    unstable_optimizeDeps: true,
  },
  serverModuleFormat: 'esm',
  ...(isVercel && { presets: [vercelPreset()] }),
} satisfies Config
