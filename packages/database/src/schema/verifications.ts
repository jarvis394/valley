import { timestamps, defaultId } from '../extend'
import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core'
import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm'

export const verifications = pgTable('verifications', {
  id: varchar().default(defaultId).primaryKey().notNull(),
  identifier: varchar().notNull(),
  value: varchar().notNull(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  ...timestamps(),
})

export type Verification = InferSelectModel<typeof verifications>

export type NewVerification = InferInsertModel<typeof verifications>
