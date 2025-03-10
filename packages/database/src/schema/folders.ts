import { defaultId, timestamps } from '../extend'
import { pgTable, text, varchar, boolean, integer } from 'drizzle-orm/pg-core'
import {
  relations,
  type InferSelectModel,
  type InferInsertModel,
} from 'drizzle-orm'
import { projects } from './projects'
import { files } from './files'

export const folders = pgTable('folders', {
  id: varchar().default(defaultId).primaryKey().notNull(),
  title: varchar().notNull(),
  description: varchar().$type<string | null>().default(null),
  isDefaultFolder: boolean(),
  totalFiles: integer().default(0).notNull(),
  totalSize: text().default('0').notNull(),
  projectId: varchar()
    .notNull()
    .references(() => projects.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  ...timestamps(),
})

export const foldersRelations = relations(folders, ({ many, one }) => ({
  project: one(projects, {
    fields: [folders.projectId],
    references: [projects.id],
  }),
  files: many(files),
}))

export type Folder = InferSelectModel<typeof folders>

export type NewFolder = InferInsertModel<typeof folders>
