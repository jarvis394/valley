import {
  db,
  files,
  folders,
  type Folder,
  type Project,
  type User,
} from '@valley/db'
import { FolderWithFiles } from '@valley/shared'
import { and, desc, eq, notExists } from 'drizzle-orm'

export const getProjectFolder = ({
  folderId,
  projectId,
  userId,
}: {
  folderId: Folder['id']
  projectId: Project['id']
  userId: User['id']
}): Promise<FolderWithFiles | undefined> => {
  return db.query.folders.findFirst({
    where: and(eq(folders.id, folderId), eq(folders.projectId, projectId)),

    // {
    //   Project: {
    //     id: projectId,
    //     userId,
    //   },
    //   id: folderId,
    // },
    with: {
      files: {
        orderBy: desc(files.createdAt),
        where: notExists(files.deletedAt),
      },
    },
  })
}
