import { pgTable, varchar, integer, primaryKey } from 'drizzle-orm/pg-core'
import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm'
import { files } from './files.js'
import { folders } from './folders.js'

export const filePositions = pgTable(
  'file_positions',
  {
    folderId: varchar()
      .notNull()
      .references(() => folders.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    fileId: varchar()
      .notNull()
      .references(() => files.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    position: integer().notNull(),
  },
  (table) => [primaryKey({ columns: [table.folderId, table.fileId] })]
)

export type FilePosition = InferSelectModel<typeof filePositions>

export type NewFilePosition = InferInsertModel<typeof filePositions>
