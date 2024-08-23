import type { ProjectCreateReq, ProjectCreateRes } from '@valley/shared'
import { api } from '.'

export const createProject = async (data: ProjectCreateReq) => {
  const res = await api({ isAccessTokenRequired: true }).post<
    void,
    ProjectCreateRes,
    ProjectCreateReq
  >('/projects/create', data)

  return res
}
