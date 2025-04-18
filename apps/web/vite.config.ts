import { reactRouter } from '@react-router/dev/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { envOnlyMacros } from 'vite-env-only'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(() => ({
  server: {
    host: true,
    port: Number(process.env.WEB_PORT) || 4200,
  },
  ssr: {
    optimizeDeps: {
      include: [
        'react',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-dom',
        'react-dom/server',
        'react-router',
        '@egjs/react-grid',
      ],
    },
  },
  build: {
    ssr: true,
    target: 'ES2022',
    minify: process.env.NODE_ENV === 'production',
    cssMinify: process.env.NODE_ENV === 'production',
    rollupOptions: {
      external: [/node:.*/, 'fsevents'],
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
  resolve: {
    alias: {
      '@egjs/react-grid': '@egjs/react-grid/dist/grid.esm.js',
    },
  },
  clearScreen: false,
  envDir: '../../',
  plugins: [envOnlyMacros(), tsconfigPaths(), tailwindcss(), reactRouter()],
}))
