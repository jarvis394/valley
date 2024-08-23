import { Folder } from '@valley/db'

export type FolderGetAllReq = unknown
export type FolderGetAllRes = {
  folders: Folder[]
}

export type FolderGetReq = unknown
export type FolderGetRes = {
  folder: Folder
}

export type FolderCreateReq = Omit<
  Folder,
  'id' | 'isDefaultFolder' | 'totalFiles' | 'totalSize'
>
export type FolderCreateRes = {
  folder: Folder
}
