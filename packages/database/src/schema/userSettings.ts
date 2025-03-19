import { pgTable, text, varchar } from 'drizzle-orm/pg-core'
import {
  relations,
  type InferSelectModel,
  type InferInsertModel,
} from 'drizzle-orm'
import { users } from './users.js'
import { defaultId } from '../extend.js'

export const userSettings = pgTable('user_settings', {
  id: varchar().default(defaultId).primaryKey().notNull(),
  interfaceLanguage: text().default('en').notNull(),
  phone: text(),
  website: text(),
  telegram: text(),
  whatsapp: text(),
  vk: text(),
  instagram: text(),
  facebook: text(),
  vimeo: text(),
  youtube: text(),
  userId: varchar()
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
})

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}))

export type UserSettings = InferSelectModel<typeof userSettings>

export type NewUserSettings = InferInsertModel<typeof userSettings>
