import { Folder, Project } from '@valley/db'

export type ProjectGetAllReq = unknown
export type ProjectGetAllRes = {
  projects: Project[]
}

export type ProjectGetReq = unknown
export type ProjectGetRes = {
  project: Project
  folders: Folder[]
}

export type ProjectCreateReq = Omit<
  Project,
  | 'id'
  | 'userId'
  | 'totalFiles'
  | 'passwordHash'
  | 'url'
  | 'dateCreated'
  | 'dateUpdated'
  | 'language'
  | 'totalSize'
> & {
  password?: string
  url?: string
}
export type ProjectCreateRes = {
  project: Project
  folders: Folder[]
}
