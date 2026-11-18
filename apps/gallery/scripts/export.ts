import { spawnSync } from 'node:child_process'
import { cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { parseArgs } from 'node:util'
import {
  getDb,
  getPublishedProject,
  getStorage,
  loadEnvFiles,
  publishedKeys,
  writeBodyToFile,
} from '@valley/backend'

/**
 * Exports published galleries as a static site any static host can serve.
 *
 *   bun run export                      every published gallery and the portfolio
 *   bun run export --slug my-wedding    one gallery at the site root
 *   bun run export --out ~/site         somewhere other than apps/gallery/dist
 */
const { values } = parseArgs({
  options: {
    slug: { type: 'string' },
    out: { type: 'string', default: 'dist' },
  },
})

const appDir = path.resolve(import.meta.dirname, '..')
const outDir = path.resolve(process.cwd(), values.out)
const builtDir = path.join(appDir, '.output/public')

loadEnvFiles([path.join(appDir, '.env'), path.join(appDir, '../../.env')])

// Marks a folder as an export's, so a rerun may empty it and a mistyped --out can't.
const MARKER = '.valley-export'
const db = getDb()
const storage = getStorage()

if (values.slug && !(await getPublishedProject(db, values.slug, (key) => key))) {
  console.error(`No public, unprotected gallery at /${values.slug}`)
  process.exit(1)
}

await mkdir(outDir, { recursive: true })
const existing = await readdir(outDir)

if (existing.length > 0 && !existing.includes(MARKER)) {
  console.error(`${outDir} has files an export didn't write; choose an empty or new folder`)
  process.exit(1)
}

const build = spawnSync('bunx', ['--bun', 'vite', 'build'], {
  cwd: appDir,
  stdio: 'inherit',
  env: { ...process.env, GALLERY_EXPORT: '1', GALLERY_EXPORT_SLUG: values.slug ?? '' },
})

if (build.status !== 0) process.exit(1)

const keys = await publishedKeys(db, values.slug)
const DOWNLOADS = 8
const pending = [...keys]
let bytes = 0

async function copyMedia(key: string) {
  const object = await storage.read(key)
  if (!object) {
    console.warn(`Skipping ${key}: missing from storage`)

    return
  }

  const file = path.join(builtDir, 'media', ...key.split('/'))
  await mkdir(path.dirname(file), { recursive: true })
  await writeBodyToFile(object.body, file)
  bytes += object.size
}

await Promise.all(
  Array.from({ length: DOWNLOADS }, async () => {
    for (let key = pending.pop(); key !== undefined; key = pending.pop()) await copyMedia(key)
  }),
)

// Lets the folder deploy to Vercel as is; other static hosts ignore it.
await writeFile(
  path.join(builtDir, 'vercel.json'),
  `${JSON.stringify(
    {
      cleanUrls: true,
      headers: [
        {
          source: '/(media|assets)/(.*)',
          headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
        },
      ],
    },
    null,
    2,
  )}\n`,
)

// Empties the folder instead of replacing it, since it may be a mounted volume.
for (const entry of await readdir(outDir)) {
  await rm(path.join(outDir, entry), { recursive: true, force: true })
}

await cp(builtDir, outDir, { recursive: true })
await writeFile(path.join(outDir, MARKER), '')
await db.close()

console.log(
  `Exported ${values.slug ? `/${values.slug}` : 'all published galleries'} with ${keys.length} media files (${(bytes / 1024 ** 2).toFixed(1)} MB) to ${outDir}`,
)
