import type { Cover, Folder, File, Project } from '@valley/db'

export type ProjectWithFolders = Project & {
  folders: Folder[]
  cover?: Array<Cover & { file: File }> | null
}
