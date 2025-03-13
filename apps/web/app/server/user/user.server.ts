import { users, db } from '@valley/db'
import { or, eq, sql } from 'drizzle-orm'

export const queryUserByDomainSql = (domain: string) =>
  or(eq(users.serviceDomain, domain), sql`${domain} = ANY(${users.domains})`)

export const queryUserByDomain = (domain: string) =>
  db
    .select({
      id: users.id,
    })
    .from(users)
    .where(queryUserByDomainSql(domain))
