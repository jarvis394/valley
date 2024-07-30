import { Folder, Project } from '@prisma/client'

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
  'id' | 'userId' | 'totalFiles' | 'passwordHash' | 'url'
> & {
  password?: string
  url?: string
}
export type ProjectCreateRes = {
  project: Project
}
