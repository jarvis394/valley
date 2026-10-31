import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { nitro } from 'nitro/vite'

export default defineConfig(() => ({
  server: { port: 3000, host: true },
  envPrefix: ['VITE_', 'GALLERY_SERVICE_URL'],
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      srcDirectory: 'src',
    }),
    viteReact(),
    // Fails the build on any function the compiler would otherwise skip silently.
    babel({ presets: [reactCompilerPreset({ panicThreshold: 'all_errors' })] }),
    nitro(),
  ],
}))
