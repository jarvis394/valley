import {
  createProject,
  getAccountViews,
  getDb,
  getProject,
  listProjects,
  resolveDocument,
  resolveRef,
  saveProject,
} from '@valley/backend'
import type { ProjectRow } from '@valley/db'
import { MEDIA_BASE } from '../config/routes'
import type { Account, Project, ProjectSummary } from '../data/types'
import { emptyDocument } from '../lib/documents'
import { mediaUrl, requireAccount } from './backend.server'

type SummaryRow = Awaited<ReturnType<typeof listProjects>>[number]

const toSummary = (row: SummaryRow): ProjectSummary => ({
  id: row.id,
  title: row.title,
  date: row.shotOn,
  thumbnail: resolveRef(row.cover, mediaUrl),
  slug: row.slug,
  visibility: row.visibility,
  files: row.assetCount,
  views: row.views,
})

const toProject = (row: ProjectRow): Project => ({
  ...toSummary(row),
  doc: resolveDocument(row.doc, mediaUrl),
  settings: row.settings,
  newFavorites: row.newFavorites,
})

export async function loadAccount(): Promise<Account> {
  const { owner } = await requireAccount()

  return {
    id: owner.id,
    name: owner.name,
    avatar: resolveRef(owner.avatar, mediaUrl) ?? '',
    views: await getAccountViews(getDb(), owner.id),
  }
}

export async function loadProjects() {
  const { accountId } = await requireAccount()

  return (await listProjects(getDb(), accountId)).map(toSummary)
}

export async function loadProject(id: string) {
  const { accountId } = await requireAccount()
  const row = await getProject(getDb(), accountId, id)

  return row ? toProject(row) : null
}

export async function startProject(meta: { title: string; date: string }) {
  const { accountId, owner } = await requireAccount()
  const doc = emptyDocument({
    ...meta,
    author: owner.name,
    authorAvatar: owner.avatar ?? undefined,
  })

  return toProject(await createProject(getDb(), accountId, doc))
}

export async function storeProject(input: { id: string; doc: unknown; settings: unknown }) {
  const { accountId } = await requireAccount()

  return saveProject(getDb(), accountId, input.id, input, MEDIA_BASE)
}
