import { Folder } from '@prisma/client'

export type FolderGetAllReq = unknown
export type FolderGetAllRes = {
  folders: Folder[]
}

export type FolderGetReq = unknown
export type FolderGetRes = {
  folder: Folder
}

export type FolderCreateReq = Omit<Folder, 'id'>
export type FolderCreateRes = {
  folder: Folder
}
