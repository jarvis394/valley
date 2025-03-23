import { db, users, eq, or, sql } from '@valley/db'

export const queryUserByDomainSql = (domain: string) =>
  or(eq(users.serviceDomain, domain), sql`${domain} = ANY(${users.domains})`)

export const queryUserByDomain = (domain: string) =>
  db
    .select({
      id: sql`TRUE`,
    })
    .from(users)
    .where(queryUserByDomainSql(domain))
