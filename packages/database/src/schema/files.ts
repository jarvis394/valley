import { defaultId, timestamps } from '../extend'
import { pgTable, jsonb, varchar, boolean, integer } from 'drizzle-orm/pg-core'
import {
  relations,
  type InferSelectModel,
  type InferInsertModel,
} from 'drizzle-orm'
import { folders } from './folders'

export type ExifDataValue = number | string | Date
export type ExifDataKey =
  | 'Artist'
  | 'Copyright'
  | 'DateTimeOriginal'
  | 'Make'
  | 'Model'
  | 'LensModel'
  | 'ExifImageWidth'
  | 'ExifImageHeight'
  | 'ExposureTime'
  | 'ISO'
  | 'FocalLength'
  | 'ApertureValue'
  | 'GPSLatitude'
  | 'GPSLongitude'
  | 'Flash'
  | 'FNumber'
  | 'Orientation'
export type ExifData = Partial<Record<ExifDataKey, ExifDataValue>>

export const files = pgTable('files', {
  id: varchar().default(defaultId).primaryKey().notNull(),
  path: varchar().notNull(),
  canHaveThumbnails: boolean().default(false),
  exif: jsonb().$type<ExifData | null>().default(null),
  contentType: varchar().default('application/octet-stream'),
  name: varchar(),
  size: varchar(),
  width: integer(),
  height: integer(),
  folderId: varchar(),
  ...timestamps({ softDelete: true }),
})

export const filesRelations = relations(files, ({ one }) => ({
  folder: one(folders, {
    fields: [files.folderId],
    references: [folders.id],
  }),
}))

export type File = InferSelectModel<typeof files>

export type NewFile = InferInsertModel<typeof files>
