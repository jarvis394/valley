import { SerializedFolder } from '../SerializedFolder'
import { SerializedProject } from '../SerializedProject'

export type ProjectGetAllReq = unknown
export type ProjectGetAllRes = {
  projects: SerializedProject[]
}

export type ProjectGetReq = unknown
export type ProjectGetRes = {
  project: SerializedProject
  folders: SerializedFolder[]
}

export type ProjectCreateReq = Omit<
  SerializedProject,
  | 'id'
  | 'userId'
  | 'totalFiles'
  | 'passwordHash'
  | 'password'
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
  project: SerializedProject
  folders: SerializedFolder[]
}
