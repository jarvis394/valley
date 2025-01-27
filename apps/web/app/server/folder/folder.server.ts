import type { Folder, Prisma, Project, User } from '@valley/db'
import { prisma } from '../db.server'
import { FolderWithFiles } from '@valley/shared'

export const getProjectFolder = ({
  folderId,
  projectId,
  userId,
  orderBy = { dateCreated: 'asc' },
}: {
  folderId: Folder['id']
  projectId: Project['id']
  userId: User['id']
  orderBy?: Prisma.FileFindManyArgs['orderBy']
}): Promise<FolderWithFiles | null> => {
  return prisma.folder.findFirst({
    where: {
      Project: {
        id: projectId,
        userId,
      },
      id: folderId,
    },
    include: {
      files: {
        orderBy,
        where: {
          isPendingDeletion: false,
        },
        include: {
          Cover: true,
        },
      },
    },
  })
}
