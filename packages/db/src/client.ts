import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

export function createDb(url: string, { max = 10 }: { max?: number } = {}) {
  // Idle connections close on their own, so one-off processes like builds can exit.
  const client = postgres(url, { max, idle_timeout: 20, onnotice: () => {} })

  return Object.assign(drizzle(client, { schema, casing: 'snake_case' }), {
    close: () => client.end(),
  })
}

export type Db = ReturnType<typeof createDb>
