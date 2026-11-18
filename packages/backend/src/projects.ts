import {
  parseDocument,
  projectSettingsSchema,
  type CanvasDocument,
  type ProjectSettings,
} from '@valley/canvas'
import { and, desc, eq, ne, projects, type Db } from '@valley/db'
import type { Storage } from '@valley/storage'
import { customAlphabet } from 'nanoid'
import { BackendError } from './errors'
import { referenceDocument } from './refs'
import { getRegistry } from './registry'

export const createProjectId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 10)

const SLUG = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/

/** Top-level paths the gallery serves itself, so no project can take them. */
const RESERVED_SLUGS = new Set(['api', 'assets', 'media', 'favicon.ico', 'robots.txt', '_build'])

export function assertSlug(slug: string) {
  if (!SLUG.test(slug) || RESERVED_SLUGS.has(slug)) {
    throw new BackendError(
      'invalid-input',
      `"${slug}" can't be a gallery address; use lowercase letters, digits and dashes`,
    )
  }

  return slug
}

/** Columns the list and gallery index read without loading documents. */
function derivedColumns(doc: CanvasDocument, settings: ProjectSettings) {
  const registry = getRegistry()

  return {
    title: doc.meta.title,
    shotOn: doc.meta.date,
    visibility: settings.visibility ?? 'private',
    protected: Boolean(settings.usePassword),
    cover: registry.thumbnailOf(doc) ?? null,
    assetCount: Object.keys(doc.assets).length,
  }
}

const summaryColumns = {
  id: projects.id,
  slug: projects.slug,
  title: projects.title,
  shotOn: projects.shotOn,
  visibility: projects.visibility,
  cover: projects.cover,
  assetCount: projects.assetCount,
  views: projects.views,
}

export const listProjects = (db: Db, accountId: string) =>
  db
    .select(summaryColumns)
    .from(projects)
    .where(eq(projects.accountId, accountId))
    .orderBy(desc(projects.shotOn), desc(projects.createdAt))

export async function getProject(db: Db, accountId: string, id: string) {
  const [row] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.accountId, accountId)))

  return row ?? null
}

export async function requireProject(db: Db, accountId: string, id: string) {
  const project = await getProject(db, accountId, id)
  if (!project) throw new BackendError('not-found', `Project ${id} not found`)

  return project
}

export async function createProject(db: Db, accountId: string, doc: CanvasDocument) {
  const id = createProjectId()
  const settings: ProjectSettings = { slug: id, visibility: 'private' }
  const [row] = await db
    .insert(projects)
    .values({ id, accountId, slug: id, doc, settings, ...derivedColumns(doc, settings) })
    .returning()

  return row!
}

/**
 * Validates an editor snapshot and stores it. `mediaBase` is the route the editor loads
 * media from, so its URLs can be turned back into storage references. A slug that is invalid
 * or taken doesn't block the save: the project keeps its current address and `slugError` says why.
 */
export async function saveProject(
  db: Db,
  accountId: string,
  id: string,
  input: { doc: unknown; settings: unknown },
  mediaBase: string,
) {
  const parsed = parseDocument(input.doc, getRegistry())
  const settings = projectSettingsSchema.parse(input.settings)
  const doc = referenceDocument(parsed.doc, mediaBase)
  const [[project], slugError] = await Promise.all([
    db
      .select({ slug: projects.slug })
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.accountId, accountId))),
    checkSlug(db, id, settings.slug || id),
  ])
  if (!project) throw new BackendError('not-found', `Project ${id} not found`)

  const slug = slugError ? project.slug : settings.slug || id

  await db
    .update(projects)
    .set({ slug, doc, settings: { ...settings, slug }, ...derivedColumns(doc, settings) })
    .where(eq(projects.id, id))

  return { slug, slugError, warnings: parsed.warnings }
}

/**
 * Removes the project and its asset rows, then its stored files. Files are cleaned up after the
 * row is gone, so a storage failure leaves orphaned files rather than a project missing its media.
 */
export async function deleteProject(db: Db, storage: Storage, accountId: string, id: string) {
  const [deleted] = await db
    .delete(projects)
    .where(and(eq(projects.id, id), eq(projects.accountId, accountId)))
    .returning({ id: projects.id })
  if (!deleted) throw new BackendError('not-found', `Project ${id} not found`)

  const keys = await listKeys(storage, `${storage.keyPrefix}projects/${id}/`).catch(() => [])
  await Promise.allSettled(keys.map((key) => storage.delete(key)))
}

async function listKeys(storage: Storage, prefix: string) {
  const keys: string[] = []
  for await (const object of storage.list(prefix)) keys.push(object.key)

  return keys
}

async function checkSlug(db: Db, id: string, slug: string) {
  try {
    assertSlug(slug)
  } catch (error) {
    return (error as BackendError).message
  }
  const [taken] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.slug, slug), ne(projects.id, id)))

  return taken ? `Another project already uses /${slug}` : undefined
}
