import { defaultCUID, defaultId, timestamps } from '../extend'
import { boolean, pgTable, varchar } from 'drizzle-orm/pg-core'
import {
  relations,
  type InferSelectModel,
  type InferInsertModel,
  sql,
} from 'drizzle-orm'
import { projects } from './projects'
import { avatars } from './avatars'
import { userSettings } from './userSettings'
import { sessions } from './sessions'
import { accounts } from './accounts'

export const users = pgTable('users', {
  id: varchar().default(defaultId).primaryKey().notNull(),
  email: varchar().notNull().unique(),
  emailVerified: boolean().notNull().default(false),
  onboarded: boolean().notNull().default(false),
  name: varchar().notNull(),
  /**
   * User gallery domains list.
   * Only first item is shown in admin panel, other domains can be taken by other users
   */
  domains: varchar()
    .array()
    .notNull()
    .default(sql`'{}'::varchar[]`),
  /** Unchangable user gallery domain */
  serviceDomain: varchar().$defaultFn(defaultCUID).notNull(),
  avatarId: varchar(),
  userSettingsId: varchar(),
  ...timestamps(),
})

export const usersRelations = relations(users, ({ many, one }) => ({
  projects: many(projects),
  sessions: many(sessions),
  accounts: many(accounts),
  userSettings: one(userSettings, {
    fields: [users.avatarId],
    references: [userSettings.id],
  }),
  avatar: one(avatars, {
    fields: [users.avatarId],
    references: [avatars.id],
  }),
}))

export type User = InferSelectModel<typeof users>

export type NewUser = InferInsertModel<typeof users>
