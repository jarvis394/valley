import { account, and, asc, assets, eq, or, projects, sql, user, type Db } from '@valley/db'
import type { Storage } from '@valley/storage'
import { nanoid } from 'nanoid'
import sharp from 'sharp'
import { BackendError } from './errors'
import { refKey, storeRef } from './refs'

const AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
export const MAX_AVATAR_BYTES = 5 * 1024 * 1024
const AVATAR_SIZE = 512

/** Earliest admin (or earliest user), which owns the public portfolio. */
export async function firstAccount(db: Db) {
  const [admin] = await db
    .select()
    .from(user)
    .where(eq(user.role, 'admin'))
    .orderBy(asc(user.createdAt))
    .limit(1)
  if (admin) return admin

  const [earliest] = await db.select().from(user).orderBy(asc(user.createdAt)).limit(1)

  return earliest ?? null
}

export async function getAccountViews(db: Db, accountId: string) {
  const [row] = await db
    .select({ views: sql<number>`coalesce(sum(${projects.views}), 0)::int` })
    .from(projects)
    .where(eq(projects.accountId, accountId))

  return row?.views ?? 0
}

export async function hasCredentialAccount(db: Db, userId: string) {
  const [row] = await db
    .select({ id: account.id })
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, 'credential')))
    .limit(1)

  return Boolean(row)
}

export async function updateProfileName(db: Db, userId: string, name: string) {
  const trimmed = name.trim()
  if (trimmed.length < 1 || trimmed.length > 64) {
    throw new BackendError('invalid-input', 'Name must be between 1 and 64 characters')
  }

  const [updated] = await db
    .update(user)
    .set({ name: trimmed })
    .where(eq(user.id, userId))
    .returning({ id: user.id, name: user.name })
  if (!updated) throw new BackendError('not-found', 'Account not found')

  return updated
}

export async function updateProfileAvatar(
  db: Db,
  storage: Storage,
  userId: string,
  file: { bytes: Uint8Array; contentType: string } | null,
) {
  const [current] = await db
    .select({ id: user.id, image: user.image })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)
  if (!current) throw new BackendError('not-found', 'Account not found')

  let nextKey: string | null = null
  if (file) {
    if (!AVATAR_TYPES.has(file.contentType)) {
      throw new BackendError('invalid-input', 'Use a JPEG, PNG, WebP, or AVIF image')
    }
    if (file.bytes.byteLength > MAX_AVATAR_BYTES) {
      throw new BackendError('invalid-input', 'Avatar image must be 5 MB or smaller')
    }

    const encoded = await sharp(file.bytes)
      .rotate()
      .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: 'cover' })
      .webp({ quality: 86 })
      .toBuffer()
      .catch(() => {
        throw new BackendError('invalid-input', 'Could not read image file')
      })

    nextKey = `${storage.keyPrefix}avatars/${userId}/${nanoid(12)}.webp`
    await storage.write(nextKey, encoded, { contentType: 'image/webp' })
  }

  const nextImage = nextKey ? storeRef(nextKey) : null
  await db.update(user).set({ image: nextImage }).where(eq(user.id, userId))

  const previousKey = refKey(current.image)
  if (previousKey && previousKey !== nextKey) {
    await storage.delete(previousKey).catch(() => {})
  }

  return nextImage
}

async function listKeys(storage: Storage, prefix: string) {
  const keys: string[] = []
  for await (const object of storage.list(prefix)) keys.push(object.key)

  return keys
}

export async function cleanupUserStorage(db: Db, storage: Storage, userId: string) {
  const [ownedProjects, [ownerRow]] = await Promise.all([
    db.select({ id: projects.id }).from(projects).where(eq(projects.accountId, userId)),
    db.select({ image: user.image }).from(user).where(eq(user.id, userId)).limit(1),
  ])

  const projectKeyLists = await Promise.all(
    ownedProjects.map((project) =>
      listKeys(storage, `${storage.keyPrefix}projects/${project.id}/`).catch(() => []),
    ),
  )
  const avatarKey = refKey(ownerRow?.image)
  const keys = [...projectKeyLists.flat(), ...(avatarKey ? [avatarKey] : [])]

  await Promise.allSettled(keys.map((key) => storage.delete(key)))
}

export async function canAccessMediaKey(
  db: Db,
  storage: Storage,
  viewer: { id: string; role: string },
  key: string,
) {
  const projectPrefix = `${storage.keyPrefix}projects/`
  if (key.startsWith(projectPrefix)) {
    const projectId = key.slice(projectPrefix.length).split('/')[0]
    if (projectId) {
      const [owned] = await db
        .select({ id: projects.id })
        .from(projects)
        .where(and(eq(projects.id, projectId), eq(projects.accountId, viewer.id)))
        .limit(1)
      if (owned) return true
    }
  }

  const [asset] = await db
    .select({ id: assets.id })
    .from(assets)
    .innerJoin(projects, eq(projects.id, assets.projectId))
    .where(
      and(
        or(eq(assets.originalKey, key), eq(assets.previewKey, key)),
        eq(projects.accountId, viewer.id),
      ),
    )
    .limit(1)
  if (asset) return true

  const ref = storeRef(key)
  const [avatarOwner] = await db
    .select({ id: user.id })
    .from(user)
    .where(
      viewer.role === 'admin'
        ? eq(user.image, ref)
        : and(eq(user.image, ref), eq(user.id, viewer.id)),
    )
    .limit(1)
  if (avatarOwner) return true

  const [projectRef] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(
      and(
        eq(projects.accountId, viewer.id),
        or(eq(projects.cover, ref), sql`${projects.doc} -> 'meta' ->> 'authorAvatar' = ${ref}`),
      ),
    )
    .limit(1)

  return Boolean(projectRef)
}
