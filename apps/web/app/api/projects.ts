import type {
  ProjectCreateReq,
  ProjectCreateRes,
  ProjectGetAllReq,
  ProjectGetAllRes,
} from '@valley/shared'
import { api } from '.'

export const createProject = async (data: ProjectCreateReq) => {
  const res = await api({ isAccessTokenRequired: true }).post<
    void,
    ProjectCreateRes,
    ProjectCreateReq
  >('/projects/create', data)

  return res
}

export const getProjects = async () => {
  const res = await api({ isAccessTokenRequired: true }).get<
    void,
    ProjectGetAllRes,
    ProjectGetAllReq
  >('/projects')

  return res
}
