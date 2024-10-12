import { vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import dotenv from '@dotenvx/dotenvx'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '../../.env') })

export default defineConfig({
  server: {
    host: true,
    port: Number(process.env.GALLERY_PORT) || 5200,
  },
  clearScreen: false,
  plugins: [
    remix({
      ignoredRouteFiles: ['**/*.css'],
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
  ],
})