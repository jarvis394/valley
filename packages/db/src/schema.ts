import type { CanvasDocument, ProjectSettings } from '@valley/canvas'
import { relations } from 'drizzle-orm'
import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}

export const visibility = pgEnum('visibility', ['private', 'public'])
export const assetKind = pgEnum('asset_kind', ['image', 'video'])

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  /** Storage reference (`store:<key>`) or an absolute URL. */
  avatar: text('avatar'),
  ...timestamps,
})

export const projects = pgTable(
  'projects',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
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

export const accountsRelations = relations(accounts, ({ many }) => ({ projects: many(projects) }))

export const projectsRelations = relations(projects, ({ one, many }) => ({
  account: one(accounts, { fields: [projects.accountId], references: [accounts.id] }),
  assets: many(assets),
}))

export const assetsRelations = relations(assets, ({ one }) => ({
  project: one(projects, { fields: [assets.projectId], references: [projects.id] }),
}))

export type AccountRow = typeof accounts.$inferSelect
export type ProjectRow = typeof projects.$inferSelect
export type AssetRow = typeof assets.$inferSelect
export type NewAssetRow = typeof assets.$inferInsert
