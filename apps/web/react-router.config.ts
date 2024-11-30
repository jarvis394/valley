import type { Config } from '@react-router/dev/config'
// import { vercelPreset } from '@vercel/remix/vite'

// const isVercel = process.env.VERCEL === '1'

export default {
  // ...(isVercel && { presets: [vercelPreset()] }),
  ssr: true,
} satisfies Config
