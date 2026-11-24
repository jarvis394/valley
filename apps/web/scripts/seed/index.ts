import { randomBytes } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import type { CanvasDocument } from '@valley/canvas'
import {
  assetRef,
  contentTypeFor,
  createProject,
  getDb,
  getStorage,
  loadEnvFiles,
  recordAsset,
  saveProject,
  storeRef,
} from '@valley/backend'
import { account as accountTable, and, eq, projects, user as userTable } from '@valley/db'
import { hashPassword } from 'better-auth/crypto'
import { MEDIA_BASE } from '../../src/config/routes'
import { emptyDocument } from '../../src/lib/documents'
import { account, projects as fixtures } from './fixtures'

/**
 * Loads the demo projects into the database and their photos into storage.
 * Run with `--force` to replace the seeded admin's projects.
 */
loadEnvFiles(
  ['../../.env', '../../../../.env'].map((file) => fileURLToPath(new URL(file, import.meta.url))),
)

const seedEmail = (process.env.VALLEY_SEED_EMAIL ?? account.email).trim().toLowerCase()
const chosenPassword = process.env.VALLEY_SEED_PASSWORD || undefined

const db = getDb()
const storage = getStorage()
const existingProjects = await db.select({ id: projects.id }).from(projects)

async function ensureSeedAdmin() {
  const [byEmail] = await db.select().from(userTable).where(eq(userTable.email, seedEmail)).limit(1)

  const [existing] =
    byEmail !== undefined
      ? [byEmail]
      : await db.select().from(userTable).where(eq(userTable.id, account.id)).limit(1)

  const owner =
    existing ??
    (
      await db
        .insert(userTable)
        .values({
          id: account.id,
          name: account.name,
          email: seedEmail,
          emailVerified: true,
          role: 'admin',
          approvedAt: new Date(),
        })
        .returning()
    )[0]!

  const [credential] = await db
    .select({ id: accountTable.id })
    .from(accountTable)
    .where(and(eq(accountTable.userId, owner.id), eq(accountTable.providerId, 'credential')))
    .limit(1)

  if (credential && !chosenPassword) return { owner, password: 'unchanged password' }

  const password = chosenPassword ?? randomBytes(12).toString('base64url')
  const passwordHash = await hashPassword(password)

  if (!credential) {
    await db.insert(accountTable).values({
      id: `${owner.id}_credential`,
      userId: owner.id,
      accountId: owner.id,
      providerId: 'credential',
      password: passwordHash,
    })
  } else {
    await db
      .update(accountTable)
      .set({ password: passwordHash })
      .where(eq(accountTable.id, credential.id))
  }

  return { owner, password }
}

const { owner, password: seedPassword } = await ensureSeedAdmin()

if (existingProjects.length > 0 && !process.argv.includes('--force')) {
  console.log(
    `Seed admin ready: ${seedEmail} / ${seedPassword}\nThe database already has ${existingProjects.length} projects; pass --force to replace them`,
  )
  await db.close()
  process.exit(0)
}

const publicDir = new URL('../../public/', import.meta.url)
const demoFile = (src: string) => readFile(new URL(src.slice(1), publicDir))
const isDemo = (src: string | undefined): src is string => Boolean(src?.startsWith('/demo/'))

async function storeDemoFile(src: string, key: string) {
  const contentType = contentTypeFor(key)
  const bytes = await demoFile(src)
  await storage.write(key, bytes, { contentType })

  return { key, contentType, size: bytes.byteLength }
}

/** Stores a demo file as an asset of `projectId` and returns its document reference. */
async function storeAsset(projectId: string, src: string, name: string) {
  const key = `${storage.keyPrefix}projects/${projectId}/demo/${src.slice('/demo/'.length)}`
  const file = await storeDemoFile(src, key)

  return assetRef(
    await recordAsset(db, storage, { ...file, projectId, name, fallback: { width: 1, height: 1 } }),
  )
}

async function storeDocument(projectId: string, doc: CanvasDocument) {
  const entries = await Promise.all(
    Object.entries(doc.assets).map(async ([id, asset]) => [
      id,
      isDemo(asset.src)
        ? { ...asset, src: await storeAsset(projectId, asset.src, asset.name) }
        : asset,
    ]),
  )
  const avatar = doc.meta.authorAvatar
  const authorAvatar = isDemo(avatar) ? await storeAsset(projectId, avatar, 'author') : avatar

  return {
    ...doc,
    assets: Object.fromEntries(entries),
    meta: { ...doc.meta, authorAvatar },
  } as CanvasDocument
}

await db.delete(projects).where(eq(projects.accountId, owner.id))

await db
  .update(userTable)
  .set({
    name: account.name,
    email: seedEmail,
    emailVerified: true,
    role: 'admin',
    approvedAt: owner.approvedAt ?? new Date(),
    image: storeRef(
      (
        await storeDemoFile(
          account.avatar,
          `${storage.keyPrefix}avatars/${owner.id}/demo-${account.avatar.slice('/demo/'.length).replaceAll('/', '-')}`,
        )
      ).key,
    ),
  })
  .where(eq(userTable.id, owner.id))

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
  const doc = await storeDocument(project.id, fixture.doc)
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

console.log(`Seed admin ready: ${seedEmail} / ${seedPassword}`)

await db.close()
