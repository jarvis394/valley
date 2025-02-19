import { vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { envOnlyMacros } from 'vite-env-only'
import { flatRoutes } from 'remix-flat-routes'
import { vercelPreset } from '@vercel/remix/vite'
// import { remixPWA } from '@remix-pwa/dev'

declare module '@remix-run/server-runtime' {
  interface Future {
    v3_singleFetch: true
  }
}

const isVercel = process.env.VERCEL === '1'

export default defineConfig(() => ({
  server: {
    host: true,
    port: Number(process.env.WEB_PORT) || 4200,
  },
  ssr: {
    noExternal: ['remix-utils'],
  },
  build: {
    ssr: true,
    target: 'ES2022',
    minify: process.env.NODE_ENV === 'production',
    cssMinify: process.env.NODE_ENV === 'production',
    rollupOptions: { external: [/node:.*/, 'fsevents'] },
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
      ...(isVercel && { presets: [vercelPreset()] }),
      ssr: true,
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
        unstable_optimizeDeps: true,
      },
    }),
    // remixPWA({
    //   // Registering SW manually because Vite plugin adds <script> tag without CSP nonce
    //   registerSW: null,
    // }),
  ],
}))
