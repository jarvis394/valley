import type { CanvasDocument, Editor, ProjectSettings, ReadAsset } from '@valley/canvas'
import type { SignupMode } from '@valley/backend'
import type { UserRole } from '@valley/db'

export interface Account {
  id: string
  name: string
  email: string
  avatar: string
  /** Gallery views across all projects. */
  views: number
  role: UserRole
  isAdmin: boolean
  hasPassword: boolean
  hasUploadedAvatar: boolean
}

export interface AuthConfig {
  signupMode: SignupMode
}

export type SessionState =
  | { status: 'signed-out' }
  | {
      status: 'pending'
      user: { id: string; name: string; email: string; avatar: string | null }
    }
  | {
      status: 'active'
      user: {
        id: string
        name: string
        email: string
        avatar: string | null
        role: UserRole
        isAdmin: boolean
      }
    }

export interface ProfileSettings {
  id: string
  name: string
  email: string
  avatar: string | null
  hasUploadedAvatar: boolean
  hasPassword: boolean
  isAdmin: boolean
}

export interface AdminUser {
  id: string
  name: string
  email: string
  emailVerified: boolean
  avatar: string | null
  role: UserRole
  approvedAt: string | null
  pending: boolean
  createdAt: string
  projects: number
  assets: number
}

export type ProjectVisibility = NonNullable<ProjectSettings['visibility']>

/** What lists and cards show; cheap to load for every project. */
export interface ProjectSummary {
  id: string
  title: string
  /** ISO date the project was shot. */
  date: string
  thumbnail?: string
  slug?: string
  visibility: ProjectVisibility
  files: number
  views: number
}

export interface Project extends ProjectSummary {
  doc: CanvasDocument
  settings: ProjectSettings
  newFavorites: number
}

/**
 * Everything the app reads or writes. Routes call it from loaders and handlers; components
 * only receive its results as props.
 */
export interface ValleyApi {
  getAccount(): Promise<Account>
  /** Most recently shot first. */
  listProjects(): Promise<ProjectSummary[]>
  getProject(id: string): Promise<Project | null>
  /** Creates a project holding `files`. Runs in the browser, which uploads them. */
  createProject(files: File[]): Promise<ProjectSummary>
  /** Permanently removes project `id` with its files. */
  deleteProject(id: string): Promise<void>
  /** The editor's `uploadAsset` for project `id`. */
  uploadAsset(id: string): ReadAsset
  /** Saves the editor's changes to project `id` as they happen. Returns a disposer. */
  syncProject(id: string, editor: Editor): () => void
}
