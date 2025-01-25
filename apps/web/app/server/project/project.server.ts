import type { Prisma, Project, User } from '@valley/db'
import { prisma } from '../db.server'
import { ProjectWithFolders } from '@valley/shared'

export const getUserProjects = ({
  userId,
  orderBy = { dateCreated: 'desc' },
}: {
  userId: User['id']
  orderBy?: Prisma.ProjectFindManyArgs['orderBy']
}): Promise<ProjectWithFolders[]> => {
  return prisma.project.findMany({
    orderBy,
    where: { userId },
    include: { folders: true },
  })
}

export const getUserProject = ({
  userId,
  projectId,
  orderBy = { dateCreated: 'asc' },
}: {
  userId: User['id']
  projectId: Project['id']
  orderBy?: Prisma.FolderFindManyArgs['orderBy']
}): Promise<ProjectWithFolders | null> => {
  return prisma.project.findFirst({
    where: { id: projectId, userId },
    include: {
      folders: {
        orderBy,
      },
    },
  })
}
