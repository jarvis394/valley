import { db, users } from '@valley/db'
import { eq, or, sql } from 'drizzle-orm'

export const queryUserByDomainSql = (domain: string) =>
  or(eq(users.serviceDomain, domain), sql`${domain} = ANY(${users.domains})`)

export const queryUserByDomain = (domain: string) =>
  db
    .select({
      id: sql`TRUE`,
    })
    .from(users)
    .where(queryUserByDomainSql(domain))
