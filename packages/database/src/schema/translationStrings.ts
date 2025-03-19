import { pgTable, text, varchar } from 'drizzle-orm/pg-core'
import {
  relations,
  type InferSelectModel,
  type InferInsertModel,
} from 'drizzle-orm'
import { projects } from './projects.js'
import { defaultId } from '../extend.js'

export const translationStrings = pgTable('translation_strings', {
  id: varchar().default(defaultId).primaryKey().notNull(),
  name: text().notNull(),
  occupation: text().notNull(),
  hint: text().notNull(),
  projectId: varchar()
    .notNull()
    .references(() => projects.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
})

export const translationStringsRelations = relations(
  translationStrings,
  ({ one }) => ({
    project: one(projects, {
      fields: [translationStrings.projectId],
      references: [projects.id],
    }),
  })
)

export type TranslationStrings = InferSelectModel<typeof translationStrings>

export type NewTranslationStrings = InferInsertModel<typeof translationStrings>
