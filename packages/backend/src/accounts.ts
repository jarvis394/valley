import { accounts, asc, eq, projects, sql, type Db } from '@valley/db'
import { readEnv } from './env'

/** The earliest account, which owns the portfolio until there are more. */
export async function firstAccount(db: Db) {
  const [account] = await db.select().from(accounts).orderBy(asc(accounts.createdAt)).limit(1)

  return account ?? null
}

/**
 * Valley has one owner until sign-in lands. Every authorized call resolves to this account,
 * created from `VALLEY_OWNER_NAME` the first time it is needed.
 */
export async function getOwner(db: Db) {
  const existing = await firstAccount(db)
  if (existing) return existing

  const [created] = await db
    .insert(accounts)
    .values({ id: 'owner', name: readEnv().VALLEY_OWNER_NAME })
    .onConflictDoNothing()
    .returning()

  return created ?? (await db.select().from(accounts).where(eq(accounts.id, 'owner')))[0]!
}

export async function getAccountViews(db: Db, accountId: string) {
  const [row] = await db
    .select({ views: sql<number>`coalesce(sum(${projects.views}), 0)::int` })
    .from(projects)
    .where(eq(projects.accountId, accountId))

  return row?.views ?? 0
}
