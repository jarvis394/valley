import type { Cover, Folder, File, Project } from '@valley/db'
import { FolderWithFiles } from './Folder.js'

export type ProjectWithFolders = Project & {
  folders: Folder[]
  cover?: (Cover & { file: File }) | null
}

export type ProjectWithFoldersAndFiles = Project & {
  folders: FolderWithFiles[]
  cover?: (Cover & { file: File }) | null
}
