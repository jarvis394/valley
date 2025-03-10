import { HasDefault, NotNull, sql } from 'drizzle-orm'
import { PgTimestampBuilderInitial, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

/** Generates UUID for primary key or UUID columns */
export const defaultId = sql`gen_random_uuid()`

/** Generates UUID for primary key or UUID columns */
export const defaultCUID = createId

/** Generates default value for JSONB column */
export const defaultJsonbValue = sql`'{}'::jsonb`

// This is common columns, `deleted_at` are optional
export function timestamps(props?: { softDelete?: false }): {
  createdAt: NotNull<HasDefault<PgTimestampBuilderInitial<''>>>
  updatedAt: NotNull<HasDefault<PgTimestampBuilderInitial<''>>>
}
export function timestamps(props: { softDelete: true }): {
  createdAt: NotNull<HasDefault<PgTimestampBuilderInitial<''>>>
  updatedAt: NotNull<HasDefault<PgTimestampBuilderInitial<''>>>
  deletedAt: PgTimestampBuilderInitial<''>
}
export function timestamps(props?: { softDelete?: boolean }) {
  const commonTimestamps = {
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  }
  const deleteTimestamp = {
    deletedAt: timestamp({ withTimezone: true }),
  }
  return props?.softDelete
    ? { ...commonTimestamps, ...deleteTimestamp }
    : commonTimestamps
}
