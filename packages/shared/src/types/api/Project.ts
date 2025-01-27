import type { Cover, Folder, File, Project } from '@valley/db'

export type ProjectWithFolders = Project & {
  folders: Folder[]
  coverImage?: (Cover & { File: File }) | null
}
