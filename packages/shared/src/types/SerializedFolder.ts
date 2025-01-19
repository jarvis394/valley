import type { Folder } from '@valley/db'

export type SerializedFolder = Omit<Folder, 'totalSize'> & {
  totalSize: number
}
