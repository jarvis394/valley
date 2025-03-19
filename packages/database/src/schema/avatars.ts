import { defaultId, timestamps } from '../extend.js'
import { pgTable, varchar } from 'drizzle-orm/pg-core'
import {
  relations,
  type InferSelectModel,
  type InferInsertModel,
} from 'drizzle-orm'
import { users } from './users.js'

export const avatars = pgTable('avatars', {
  id: varchar().default(defaultId).primaryKey().notNull(),
  path: varchar().notNull(),
  size: varchar(),
  userId: varchar().references(() => users.id, {
    onDelete: 'cascade',
    onUpdate: 'cascade',
  }),
  ...timestamps(),
})

export const avatarsRelations = relations(avatars, ({ one }) => ({
  user: one(users, {
    fields: [avatars.userId],
    references: [users.avatarId],
  }),
}))

export type Avatar = InferSelectModel<typeof avatars>

export type NewAvatar = InferInsertModel<typeof avatars>
