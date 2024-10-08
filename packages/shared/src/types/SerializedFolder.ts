import { File, Folder } from '@valley/db'

export type SerializedFolder = Omit<Folder, 'totalSize'> & {
  totalSize: number
  files: File[]
}
