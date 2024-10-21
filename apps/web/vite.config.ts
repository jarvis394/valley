import { vitePlugin as remix } from '@remix-run/dev'
import { remixPWA } from '@remix-pwa/dev'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import dotenv from '@dotenvx/dotenvx'
import path from 'path'
import { envOnlyMacros } from 'vite-env-only'
import { flatRoutes } from 'remix-flat-routes'

dotenv.config({ path: path.join(__dirname, '../../.env') })

export default defineConfig({
  server: {
    host: true,
    port: Number(process.env.WEB_PORT) || 4200,
  },
  build: {
    cssMinify: process.env.NODE_ENV === 'production',
    rollupOptions: {
      external: [/node:.*/, 'fsevents'],
    },
    assetsInlineLimit: (source: string) => {
      if (
        source.endsWith('sprite.svg') ||
        source.endsWith('favicon.svg') ||
        source.endsWith('apple-touch-icon.png')
      ) {
        return false
      } else {
        return true
      }
    },
    sourcemap: process.env.NODE_ENV !== 'production',
  },
  clearScreen: false,
  envDir: '../../',
  plugins: [
    envOnlyMacros(),
    tsconfigPaths(),
    remix({
      ignoredRouteFiles: ['**/*'],
      serverModuleFormat: 'esm',
      routes: async (defineRoutes) => {
        return flatRoutes('routes', defineRoutes, {
          ignoredRouteFiles: [
            '.*',
            '**/*.css',
            '**/*.test.{js,jsx,ts,tsx}',
            '**/__*.*',
            // This is for server-side utilities you want to colocate
            // next to your routes without making an additional
            // directory. If you need a route that includes "server" or
            // "client" in the filename, use the escape brackets like:
            // my-route.[server].tsx
            '**/*.server.*',
            '**/*.client.*',
          ],
        })
      },
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    remixPWA(),
  ],
})
