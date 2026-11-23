import { and, assets, desc, eq, or, projects, sql, user, type Db } from '@valley/db'
import { firstAccount } from './accounts'
import { documentKeys, refKey, resolveDocument, resolveRef, storeRef, type UrlFor } from './refs'

/** Projects anyone may see: public and without a password. */
const published = and(eq(projects.visibility, 'public'), eq(projects.protected, false))

export async function getPortfolio(db: Db, urlFor: UrlFor) {
  const owner = await firstAccount(db)
  if (!owner) return null

  const rows = await db
    .select({
      id: projects.id,
      slug: projects.slug,
      title: projects.title,
      shotOn: projects.shotOn,
      cover: projects.cover,
      assetCount: projects.assetCount,
    })
    .from(projects)
    .where(and(eq(projects.accountId, owner.id), published))
    .orderBy(desc(projects.shotOn), desc(projects.createdAt))

  return {
    owner: { name: owner.name, avatar: resolveRef(owner.image, urlFor) },
    projects: rows.map((row) => ({ ...row, cover: resolveRef(row.cover, urlFor) })),
  }
}

export async function getPublishedProject(db: Db, slug: string, urlFor: UrlFor) {
  const [row] = await db
    .select({ id: projects.id, slug: projects.slug, doc: projects.doc })
    .from(projects)
    .where(and(eq(projects.slug, slug), published))
  if (!row) return null

  return { ...row, doc: resolveDocument(row.doc, urlFor) }
}

export async function recordView(db: Db, projectId: string) {
  await db
    .update(projects)
    .set({ views: sql`${projects.views} + 1`, updatedAt: sql`${projects.updatedAt}` })
    .where(eq(projects.id, projectId))
}

/**
 * Whether a published page shows a key: as an asset of a published project, through its
 * document like `documentKeys`, or as an account avatar. Cheapest checks first.
 */
export async function isPublishedKey(db: Db, key: string) {
  const ref = storeRef(key)
  const [asset] = await db
    .select({ id: assets.id })
    .from(assets)
    .innerJoin(projects, eq(projects.id, assets.projectId))
    .where(and(or(eq(assets.originalKey, key), eq(assets.previewKey, key)), published))
    .limit(1)
  if (asset) return true

  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(
      and(
        published,
        or(
          eq(projects.cover, ref),
          sql`${projects.doc} -> 'meta' ->> 'authorAvatar' = ${ref}`,
          sql`exists (select 1 from jsonb_each(${projects.doc} -> 'assets') as asset
            where asset.value ->> 'src' = ${ref} or asset.value ->> 'poster' = ${ref})`,
        ),
      ),
    )
    .limit(1)
  if (project) return true

  const [avatar] = await db.select({ id: user.id }).from(user).where(eq(user.image, ref)).limit(1)

  return Boolean(avatar)
}

/** Storage keys of every published project, or of the one at `slug`, for a static export. */
export async function publishedKeys(db: Db, slug?: string) {
  const [rows, owners] = await Promise.all([
    db
      .select({ doc: projects.doc, cover: projects.cover })
      .from(projects)
      .where(and(published, slug ? eq(projects.slug, slug) : undefined)),
    db.select({ image: user.image }).from(user),
  ])
  const refs = [
    ...rows.flatMap((row) => [...documentKeys(row.doc), refKey(row.cover)]),
    ...owners.map((owner) => refKey(owner.image)),
  ]

  return [...new Set(refs.filter((key) => key !== null))]
}
