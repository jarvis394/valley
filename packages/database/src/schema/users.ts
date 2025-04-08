import { defaultCUID, defaultId, timestamps } from '../extend.js'
import { boolean, pgTable, varchar } from 'drizzle-orm/pg-core'
import {
  relations,
  type InferSelectModel,
  type InferInsertModel,
  sql,
} from 'drizzle-orm'
import { projects } from './projects.js'
import { userSettings } from './userSettings.js'
import { sessions } from './sessions.js'
import { accounts } from './accounts.js'
import { files } from './files.js'

export const users = pgTable('users', {
  id: varchar().default(defaultId).primaryKey().notNull(),
  email: varchar().notNull().unique(),
  emailVerified: boolean().notNull().default(false),
  onboarded: boolean().notNull().default(false),
  name: varchar().notNull(),
  // TODO: remove when better-auth allows to change schema
  /** Better Auth required field */
  image: varchar(),
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
  avatar: one(files, {
    fields: [users.avatarId],
    references: [files.id],
  }),
}))

export type User = InferSelectModel<typeof users>

export type NewUser = InferInsertModel<typeof users>
