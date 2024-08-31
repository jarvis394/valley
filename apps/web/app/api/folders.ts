import type {
  FolderCreateReq,
  FolderCreateRes,
  FolderEditReq,
  FolderEditRes,
} from '@valley/shared'
import { Project } from '@valley/db'
import { api } from '.'

export const createFolder = async (data: FolderCreateReq) => {
  const res = await api({ isAccessTokenRequired: true }).post<
    void,
    FolderCreateRes,
    FolderCreateReq
  >('/projects/' + data.projectId + '/folders/create', data)

  return res
}

export const editFolder = async (
  data: FolderEditReq,
  projectId: Project['id']
) => {
  const res = await api({ isAccessTokenRequired: true }).post<
    void,
    FolderEditRes,
    FolderEditReq
  >('/projects/' + projectId + '/folders/' + data.id + '/edit', data)

  return res
}
