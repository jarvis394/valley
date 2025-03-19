import { pgTable, doublePrecision, varchar } from 'drizzle-orm/pg-core'
import {
  relations,
  type InferSelectModel,
  type InferInsertModel,
} from 'drizzle-orm'
import { files } from './files.js'
import { projects } from './projects.js'

export const covers = pgTable('covers', {
  x: doublePrecision().default(0.5),
  y: doublePrecision().default(0.5),
  projectId: varchar()
    .notNull()
    .unique()
    .references(() => projects.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  fileId: varchar()
    .notNull()
    .unique()
    .references(() => files.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
})

export const coversRelations = relations(covers, ({ one }) => ({
  project: one(projects, {
    fields: [covers.projectId],
    references: [projects.id],
  }),
  file: one(files, {
    fields: [covers.fileId],
    references: [files.id],
  }),
}))

export type Cover = InferSelectModel<typeof covers>

export type NewCover = InferInsertModel<typeof covers>
