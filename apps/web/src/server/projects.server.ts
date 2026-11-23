import {
  createProject,
  deleteProject,
  getAccountViews,
  getDb,
  getProject,
  getStorage,
  hasCredentialAccount,
  listProjects,
  refKey,
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
  const { user } = await requireAccount()
  const [views, hasPassword] = await Promise.all([
    getAccountViews(getDb(), user.id),
    hasCredentialAccount(getDb(), user.id),
  ])

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: resolveRef(user.image, mediaUrl) ?? '',
    views,
    role: user.role === 'admin' ? 'admin' : 'user',
    isAdmin: user.role === 'admin',
    hasPassword,
    hasUploadedAvatar: Boolean(refKey(user.image)),
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
  const { accountId, user } = await requireAccount()
  const doc = emptyDocument({
    ...meta,
    author: user.name,
    authorAvatar: user.image ?? undefined,
  })

  return toProject(await createProject(getDb(), accountId, doc))
}

export async function removeProject(id: string) {
  const { accountId } = await requireAccount()

  await deleteProject(getDb(), getStorage(), accountId, id)
}

export async function storeProject(input: { id: string; doc: unknown; settings: unknown }) {
  const { accountId } = await requireAccount()

  return saveProject(getDb(), accountId, input.id, input, MEDIA_BASE)
}
