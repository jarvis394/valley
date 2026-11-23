import {
  and,
  asc,
  assets,
  count,
  eq,
  isNull,
  ne,
  projects,
  sql,
  user,
  type Db,
  type UserRole,
} from '@valley/db'
import type { Storage } from '@valley/storage'
import { cleanupUserStorage } from './accounts'
import { isApproved } from './auth/rules'
import { BackendError } from './errors'
import { type Mailer, approvedMail } from './mail'
import { resolveRef, type UrlFor } from './refs'

const byAccount = (rows: { accountId: string; n: number }[]) =>
  new Map(rows.map((row) => [row.accountId, row.n]))

export async function listUsers(db: Db, urlFor: UrlFor) {
  const [users, projectCounts, assetCounts] = await Promise.all([
    db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        role: user.role,
        approvedAt: user.approvedAt,
        createdAt: user.createdAt,
      })
      .from(user)
      .orderBy(asc(user.createdAt)),
    db
      .select({ accountId: projects.accountId, n: count() })
      .from(projects)
      .groupBy(projects.accountId),
    db
      .select({ accountId: projects.accountId, n: count() })
      .from(assets)
      .innerJoin(projects, eq(projects.id, assets.projectId))
      .groupBy(projects.accountId),
  ])

  const projectCount = byAccount(projectCounts)
  const assetCount = byAccount(assetCounts)

  return users.map(({ image, ...row }) => ({
    ...row,
    avatar: resolveRef(image, urlFor) ?? null,
    pending: !isApproved(row),
    projects: projectCount.get(row.id) ?? 0,
    assets: assetCount.get(row.id) ?? 0,
  }))
}

export async function countPendingUsers(db: Db) {
  const [row] = await db
    .select({ n: count() })
    .from(user)
    .where(and(isNull(user.approvedAt), ne(user.role, 'admin')))

  return row?.n ?? 0
}

export async function approveUser(
  { db, mailer, publicUrl }: { db: Db; mailer: Mailer; publicUrl: string },
  id: string,
) {
  const [row] = await db
    .update(user)
    .set({ approvedAt: sql`now()` })
    .where(and(eq(user.id, id), isNull(user.approvedAt)))
    .returning({ email: user.email, emailVerified: user.emailVerified })

  if (!row) {
    const [exists] = await db.select({ id: user.id }).from(user).where(eq(user.id, id)).limit(1)

    return exists ? ('approved' as const) : ('not_found' as const)
  }

  if (row.emailVerified) {
    await mailer
      .send(approvedMail({ to: row.email, url: publicUrl }))
      .catch((error: unknown) => console.warn(`Approval mail not sent for ${id}`, error))
  }

  return 'approved' as const
}

export async function setUserRole(db: Db, actorId: string, targetId: string, role: UserRole) {
  if (actorId === targetId) {
    throw new BackendError('conflict', 'cannot_change_own_role')
  }

  const [row] = await db
    .update(user)
    .set(
      role === 'admin' ? { role, approvedAt: sql`coalesce(${user.approvedAt}, now())` } : { role },
    )
    .where(eq(user.id, targetId))
    .returning({ id: user.id })
  if (!row) throw new BackendError('not-found', 'User not found')

  return 'updated' as const
}

export async function deleteAdminUser(db: Db, storage: Storage, actorId: string, targetId: string) {
  if (actorId === targetId) {
    throw new BackendError('conflict', 'cannot_delete_self')
  }

  const [exists] = await db.select({ id: user.id }).from(user).where(eq(user.id, targetId)).limit(1)
  if (!exists) throw new BackendError('not-found', 'User not found')

  await cleanupUserStorage(db, storage, targetId)
  await db.delete(user).where(eq(user.id, targetId))

  return 'deleted' as const
}
