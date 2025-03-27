import { DrizzleConfig } from 'drizzle-orm'
import {
  drizzle as drizzleNeon,
  type NeonDatabase,
} from 'drizzle-orm/neon-serverless'
// import {
//   drizzle as drizzlePg,
//   type PostgresJsDatabase,
// } from 'drizzle-orm/postgres-js'
import * as schema from './schema/index.js'
import { init } from './env.js'

init()

export type Schema = typeof schema

export type DatabaseClientType = NeonDatabase<Schema>
// | PostgresJsDatabase<Schema>

const dbConfig: DrizzleConfig<Schema> = {
  schema,
  casing: 'snake_case',
}

// export const db: DatabaseClientType =
//   process.env.DATABASE_DRIVER === 'neon'
//     ? drizzleNeon(process.env.DATABASE_URL, dbConfig)
//     : drizzlePg(process.env.DATABASE_URL, dbConfig)
export const db: DatabaseClientType = drizzleNeon(
  process.env.DATABASE_URL,
  dbConfig
)
