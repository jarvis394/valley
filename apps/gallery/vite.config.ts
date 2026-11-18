import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig, loadEnv } from 'vite'
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { nitro } from 'nitro/vite'

const repoRoot = new URL('../..', import.meta.url).pathname

export default defineConfig(({ command, mode }) => {
  // Server code reads process.env; in dev it comes from the repo's and this app's .env files.
  for (const [name, value] of Object.entries({
    ...loadEnv(mode, repoRoot, ''),
    ...loadEnv(mode, import.meta.dirname, ''),
  })) {
    process.env[name] ??= value
  }

  // Set by scripts/export.ts: prerender every published page into static HTML.
  const exporting = process.env.GALLERY_EXPORT === '1'

  return {
    server: { port: 3001, host: true },
    resolve: {
      tsconfigPaths: true,
    },
    // Builds bundle every dependency: the output ships without node_modules, and CommonJS requires
    // such as use-sync-external-store's `react` would stay unresolved. Dev can't run inlined
    // CommonJS, so it keeps them external. Nitro ships sharp's native binary as a traced dependency.
    // egjs ships CommonJS as `main`, which dev SSR can't import by name; transform its ESM build.
    ssr:
      command === 'build'
        ? { noExternal: true, external: ['sharp'] }
        : { noExternal: [/^@egjs\//, /^@cfcs\//] },
    plugins: [
      tailwindcss(),
      tanstackStart({
        srcDirectory: 'src',
        prerender: exporting ? { enabled: true, crawlLinks: true, failOnError: true } : undefined,
      }),
      viteReact(),
      // Fails the build on any function the compiler would otherwise skip silently.
      babel({ presets: [reactCompilerPreset({ panicThreshold: 'all_errors' })] }),
      nitro(),
    ],
  }
})
