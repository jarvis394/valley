import { users, db, or, eq, sql } from '@valley/db'

export const queryUserByDomainSql = (domain: string) =>
  or(eq(users.serviceDomain, domain), sql`${domain} = ANY(${users.domains})`)

export const queryUserByDomain = (domain: string) =>
  db
    .select({
      id: users.id,
    })
    .from(users)
    .where(queryUserByDomainSql(domain))
