import { Folder } from '@valley/db'

export type SerializedFolder = Omit<Folder, 'totalSize'> & {
  totalSize: number
}
