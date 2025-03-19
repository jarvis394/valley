import type { Cover, File, Folder } from '@valley/db'

export type FolderWithFiles = Folder & {
  files: Array<File & { cover?: Cover[] | null }>
}
