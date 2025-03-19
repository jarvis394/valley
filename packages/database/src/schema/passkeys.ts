import { defaultId } from '../extend.js'
import {
  pgTable,
  varchar,
  timestamp,
  integer,
  boolean,
} from 'drizzle-orm/pg-core'
import {
  type InferSelectModel,
  type InferInsertModel,
  relations,
} from 'drizzle-orm'
import { users } from './users.js'

export const passkeys = pgTable('passkeys', {
  id: varchar().default(defaultId).primaryKey().notNull(),
  name: varchar(),
  publicKey: varchar().notNull(),
  credentialID: varchar().notNull(),
  counter: integer().notNull(),
  deviceType: varchar().notNull(),
  transports: varchar().notNull(),
  backedUp: boolean().notNull(),
  userId: varchar()
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  createdAt: timestamp({ withTimezone: true }).notNull(),
})

export const passkeysRelations = relations(passkeys, ({ one }) => ({
  user: one(users, {
    fields: [passkeys.userId],
    references: [users.id],
  }),
}))

export type Passkey = InferSelectModel<typeof passkeys>

export type NewPasskey = InferInsertModel<typeof passkeys>
