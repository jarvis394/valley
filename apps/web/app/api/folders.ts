import type { FolderCreateReq, FolderCreateRes } from '@valley/shared'
import { api } from '.'

export const createFolder = async (data: FolderCreateReq) => {
  const res = await api({ isAccessTokenRequired: true }).post<
    void,
    FolderCreateRes,
    FolderCreateReq
  >('/projects/' + data.projectId + '/folders/create', data)

  return res
}
