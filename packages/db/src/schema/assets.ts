import { bigint, index, integer, pgEnum, pgTable, text } from 'drizzle-orm/pg-core'
import { timestamps } from './columns'
import { projects } from './projects'

export const assetKind = pgEnum('asset_kind', ['image', 'video'])

/** One uploaded file and its derived renditions. */
export const assets = pgTable(
  'assets',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    kind: assetKind('kind').notNull(),
    name: text('name').notNull(),
    contentType: text('content_type').notNull(),
    size: bigint('size', { mode: 'number' }).notNull(),
    width: integer('width').notNull(),
    height: integer('height').notNull(),
    originalKey: text('original_key').notNull().unique(),
    /** Web-sized rendition the canvas shows. Null when the original is shown as is. */
    previewKey: text('preview_key').unique(),
    ...timestamps,
  },
  (table) => [index('assets_project_idx').on(table.projectId)],
)

export type AssetRow = typeof assets.$inferSelect
export type NewAssetRow = typeof assets.$inferInsert
