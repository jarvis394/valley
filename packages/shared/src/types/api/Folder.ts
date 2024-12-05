import { File, Folder } from '@valley/db'

export type FolderWithFiles = Folder & {
  files: File[]
}
