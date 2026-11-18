import { readFile } from 'node:fs/promises'
import type { CanvasDocument } from '@valley/canvas'
import {
  assetRef,
  contentTypeFor,
  createProject,
  getDb,
  getOwner,
  getStorage,
  loadEnvFiles,
  recordAsset,
  saveProject,
  storeRef,
} from '@valley/backend'
import { accounts, eq, projects } from '@valley/db'
import { MEDIA_BASE } from '../../src/config/routes'
import { emptyDocument } from '../../src/lib/documents'
import { account, projects as fixtures } from './fixtures'

/**
 * Loads the demo projects into the database and their photos into storage.
 * Run with `--force` to replace the owner's projects.
 */
loadEnvFiles(
  ['../../.env', '../../../../.env'].map((file) => new URL(file, import.meta.url).pathname),
)

const db = getDb()
const storage = getStorage()
const owner = await getOwner(db)
const existing = await db.select({ id: projects.id }).from(projects)

if (existing.length > 0 && !process.argv.includes('--force')) {
  console.log(`The database already has ${existing.length} projects; pass --force to replace them`)
  await db.close()
  process.exit(0)
}

const publicDir = new URL('../../public/', import.meta.url)
const demoFile = (src: string) => readFile(new URL(src.slice(1), publicDir))
const isDemo = (src: string | undefined): src is string => Boolean(src?.startsWith('/demo/'))

async function storeDemoFile(src: string, folder: string) {
  const key = `${storage.keyPrefix}demo/${folder}/${src.slice('/demo/'.length)}`
  const contentType = contentTypeFor(key)
  const bytes = await demoFile(src)
  await storage.write(key, bytes, { contentType })

  return { key, contentType, size: bytes.byteLength }
}

/** Stores a demo file as an asset of `projectId` and returns its document reference. */
async function storeAsset(projectId: string, folder: string, src: string, name: string) {
  const file = await storeDemoFile(src, folder)

  return assetRef(
    await recordAsset(db, storage, { ...file, projectId, name, fallback: { width: 1, height: 1 } }),
  )
}

async function storeDocument(projectId: string, folder: string, doc: CanvasDocument) {
  const entries = await Promise.all(
    Object.entries(doc.assets).map(async ([id, asset]) => [
      id,
      isDemo(asset.src)
        ? { ...asset, src: await storeAsset(projectId, folder, asset.src, asset.name) }
        : asset,
    ]),
  )
  const avatar = doc.meta.authorAvatar
  const authorAvatar = isDemo(avatar)
    ? await storeAsset(projectId, folder, avatar, 'author')
    : avatar

  return {
    ...doc,
    assets: Object.fromEntries(entries),
    meta: { ...doc.meta, authorAvatar },
  } as CanvasDocument
}

await db.delete(projects).where(eq(projects.accountId, owner.id))

await db
  .update(accounts)
  .set({
    name: account.name,
    avatar: storeRef((await storeDemoFile(account.avatar, 'account')).key),
  })
  .where(eq(accounts.id, owner.id))

for (const fixture of fixtures) {
  const project = await createProject(
    db,
    owner.id,
    emptyDocument({
      title: fixture.doc.meta.title,
      date: fixture.doc.meta.date,
      author: account.name,
    }),
  )
  const doc = await storeDocument(project.id, fixture.id, fixture.doc)
  const { slugError } = await saveProject(
    db,
    owner.id,
    project.id,
    { doc, settings: fixture.settings },
    MEDIA_BASE,
  )
  await db
    .update(projects)
    .set({ views: fixture.views, newFavorites: fixture.newFavorites })
    .where(eq(projects.id, project.id))
  console.log(`Seeded ${fixture.doc.meta.title}${slugError ? ` (${slugError})` : ''}`)
}

await db.close()
