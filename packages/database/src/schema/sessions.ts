import { defaultId, timestamps } from '../extend'
import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core'
import {
  relations,
  type InferSelectModel,
  type InferInsertModel,
} from 'drizzle-orm'
import { users } from './users'

export const sessions = pgTable('sessions', {
  id: varchar().default(defaultId).primaryKey().notNull(),
  token: varchar().notNull(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  ipAddress: varchar(),
  userAgent: varchar(),
  userId: varchar()
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  ...timestamps(),
})

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export type Session = InferSelectModel<typeof sessions>

export type NewSession = InferInsertModel<typeof sessions>
