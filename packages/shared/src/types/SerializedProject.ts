import { Project } from '@valley/db'

export type SerializedProject = Omit<Project, 'totalSize'> & {
  totalSize: number
}
