import type { CanvasDocument, Editor, ProjectSettings } from '@valley/canvas'

export interface Account {
  id: string
  name: string
  avatar: string
  /** Gallery views across all projects. */
  views: number
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
 * only receive its results as props, so a backend replaces the mock without touching UI.
 */
export interface ValleyApi {
  getAccount(): Promise<Account>
  /** Most recently shot first. */
  listProjects(): Promise<ProjectSummary[]>
  getProject(id: string): Promise<Project | null>
  createProject(files: File[]): Promise<ProjectSummary>
  /** Saves the editor's changes to project `id` as they happen. Returns a disposer. */
  syncProject(id: string, editor: Editor): () => void
}
