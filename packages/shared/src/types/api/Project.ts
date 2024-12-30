import { Folder, Project } from '@valley/db'

export type ProjectWithFolders = Project & {
  folders: Folder[]
}
