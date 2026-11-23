import type { CanvasDocument, ProjectSettings } from '@valley/canvas'
import { boolean, index, integer, jsonb, pgEnum, pgTable, text } from 'drizzle-orm/pg-core'
import { user } from './auth'
import { timestamps } from './columns'

export const visibility = pgEnum('visibility', ['private', 'public'])

export const projects = pgTable(
  'projects',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    /** Mirrors `settings.slug`, so the gallery can look a project up by its URL. */
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    /** ISO date the project was shot. Mirrors `doc.meta.date`. */
    shotOn: text('shot_on').notNull(),
    visibility: visibility('visibility').notNull().default('private'),
    /** Mirrors `settings.usePassword`; a protected project is never served publicly. */
    protected: boolean('protected').notNull().default(false),
    /** Thumbnail as a `store:<key>` reference, derived from `doc` on save. */
    cover: text('cover'),
    assetCount: integer('asset_count').notNull().default(0),
    /** Asset `src`s hold `store:<key>` references, resolved per surface when read. */
    doc: jsonb('doc').$type<CanvasDocument>().notNull(),
    settings: jsonb('settings').$type<ProjectSettings>().notNull(),
    views: integer('views').notNull().default(0),
    newFavorites: integer('new_favorites').notNull().default(0),
    ...timestamps,
  },
  (table) => [index('projects_account_idx').on(table.accountId, table.shotOn)],
)

export type ProjectRow = typeof projects.$inferSelect
