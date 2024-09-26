import type {
  FolderCreateReq,
  FolderCreateRes,
  FolderDeleteReq,
  FolderDeleteRes,
  FolderEditReq,
  FolderEditRes,
} from '@valley/shared'
import { Folder, Project } from '@valley/db'
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

export const deleteFolder = async (
  projectId: Project['id'],
  folderId: Folder['id']
) => {
  const res = await api({ isAccessTokenRequired: true }).delete<
    void,
    FolderDeleteRes,
    FolderDeleteReq
  >('/projects/' + projectId + '/folders/' + folderId + '/delete')

  return res
}
