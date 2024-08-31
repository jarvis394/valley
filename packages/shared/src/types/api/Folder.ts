import { File, Folder } from '@valley/db'
import { SerializedFolder } from '../SerializedFolder'

export type FolderCreateReq = Omit<
  SerializedFolder,
  'id' | 'isDefaultFolder' | 'totalFiles' | 'totalSize'
>
export type FolderCreateRes = {
  folder: SerializedFolder
  files: File[]
}

export type FolderEditReq = Partial<
  Omit<
    SerializedFolder,
    'id' | 'isDefaultFolder' | 'totalFiles' | 'totalSize' | 'projectId'
  >
> & { id: Folder['id'] }
export type FolderEditRes = {
  folder: SerializedFolder
}

export type FolderGetReq = unknown
export type FolderGetRes = {
  folder: SerializedFolder
  files: File[]
}
