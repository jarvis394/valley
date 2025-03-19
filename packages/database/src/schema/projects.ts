import { defaultId, timestamps } from '../extend.js'
import {
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
  integer,
} from 'drizzle-orm/pg-core'
import {
  relations,
  type InferSelectModel,
  type InferInsertModel,
} from 'drizzle-orm'
import { users } from './users.js'
import { folders } from './folders.js'
import { translationStrings } from './translationStrings.js'
import { covers } from './covers.js'

export const projects = pgTable('projects', {
  id: varchar().default(defaultId).primaryKey().notNull(),
  title: varchar().notNull(),
  slug: varchar().notNull(),
  dateShot: timestamp({ withTimezone: true })
    .$type<Date | null>()
    .default(null),
  language: varchar().default('en').notNull(),
  protected: boolean().default(false).notNull(),
  passwordHash: varchar().$type<string | null>().default(null),
  storedUntil: timestamp({ withTimezone: true })
    .$type<Date | null>()
    .default(null),
  totalFiles: integer().default(0).notNull(),
  totalSize: text().default('0').notNull(),
  userId: varchar()
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  translationStringsId: varchar(),
  ...timestamps(),
})

export const projectsRelations = relations(projects, ({ many, one }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  translationStrings: one(translationStrings, {
    fields: [projects.translationStringsId],
    references: [translationStrings.id],
  }),
  folders: many(folders),
  cover: many(covers),
}))

export type Project = InferSelectModel<typeof projects>

export type NewProject = InferInsertModel<typeof projects>
