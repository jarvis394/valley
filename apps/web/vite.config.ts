import { vitePlugin as remix } from '@remix-run/dev'
import { remixPWA } from '@remix-pwa/dev'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { envOnlyMacros } from 'vite-env-only'
import { flatRoutes } from 'remix-flat-routes'
import { vercelPreset } from '@vercel/remix/vite'

declare module '@remix-run/server-runtime' {
  interface Future {
    v3_singleFetch: true
  }
}

export default defineConfig(() => ({
  server: {
    host: true,
    port: Number(process.env.WEB_PORT) || 4200,
  },
  build: {
    ssr: true,
    cssMinify: process.env.NODE_ENV === 'production',
    rollupOptions: {
      // TODO: fix external node:* packages being put in client code
      // external: [/node:.*/, 'fsevents'],
    },
    assetsInlineLimit: (source) => {
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
      presets: [vercelPreset()],
      ignoredRouteFiles: ['**/*'],
      serverModuleFormat: 'esm',
      routes: async (defineRoutes) => {
        return flatRoutes('routes', defineRoutes, {
          ignoredRouteFiles: [
            '.*',
            '**/*.css',
            '**/*.test.{js,jsx,ts,tsx}',
            '**/__*.*',
            '**/*.server.*',
            '**/*.client.*',
          ],
        })
      },
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_lazyRouteDiscovery: true,
        v3_singleFetch: true,
      },
    }),
    remixPWA({
      // Registering SW manually because Vite plugin adds <script> tag without CSP nonce
      registerSW: null,
    }),
  ],
}))
