import { neon } from '@neondatabase/serverless'
import { DrizzleConfig } from 'drizzle-orm'
import {
  drizzle as drizzleNeon,
  type NeonHttpDatabase,
} from 'drizzle-orm/neon-http'
import {
  drizzle as drizzlePg,
  type PostgresJsDatabase,
} from 'drizzle-orm/postgres-js'
import * as schema from './schema'
import postgres from 'postgres'
import { init } from './env'

init()

export type Schema = typeof schema

export type DatabaseClientType =
  | NeonHttpDatabase<Schema>
  | PostgresJsDatabase<Schema>

/** Postgres client for queries */
export const dbClient =
  process.env.DATABASE_DRIVER === 'neon'
    ? neon(process.env.DATABASE_URL)
    : postgres(process.env.DATABASE_URL)

const dbConfig: DrizzleConfig<Schema> = {
  schema,
  casing: 'snake_case',
}

export const db: DatabaseClientType =
  process.env.DATABASE_DRIVER === 'neon'
    ? drizzleNeon(neon(process.env.DATABASE_URL), dbConfig)
    : drizzlePg(postgres(process.env.DATABASE_URL), dbConfig)
