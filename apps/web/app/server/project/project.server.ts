import {
  db,
  files,
  folders,
  projects,
  type Project,
  type User,
} from '@valley/db'
import { ProjectWithFolders } from '@valley/shared'
import { and, asc, desc, eq, isNull } from 'drizzle-orm'

export const getUserProjects = ({
  userId,
}: {
  userId: User['id']
}): Promise<ProjectWithFolders[]> => {
  return db.query.projects.findMany({
    orderBy: desc(projects.createdAt),
    where: eq(projects.userId, userId),
    with: {
      folders: true,
      cover: {
        with: { file: true },
        // where: isNull(files.deletedAt),
      },
    },
  })
}

export const getUserProject = ({
  userId,
  projectId,
}: {
  userId: User['id']
  projectId: Project['id']
}): Promise<ProjectWithFolders | undefined> => {
  return db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.userId, userId)),
    with: {
      folders: {
        orderBy: asc(folders.createdAt),
      },
      cover: {
        with: { file: true },
        where: isNull(files.deletedAt),
      },
    },
  })
}
