import {
  db,
  files,
  folders,
  projects,
  users,
  type Folder,
  type Project,
  type User,
} from '@valley/db'
import { and, desc, eq, exists, isNull, sql } from 'drizzle-orm'

export const getProjectFolder = async ({
  folderId,
  projectId,
  userId,
}: {
  folderId: Folder['id']
  projectId: Project['id']
  userId: User['id']
}) => {
  const [folder] = await db
    .select()
    .from(folders)
    .where(
      and(
        eq(folders.id, folderId),
        exists(
          db
            .select({ id: sql`TRUE` })
            .from(projects)
            .innerJoin(users, eq(projects.userId, users.id))
            .where(and(eq(users.id, userId), eq(projects.id, projectId)))
        )
      )
    )
  return folder
}

export const getProjectFolderAndProject = async ({
  folderId,
  projectId,
  userId,
}: {
  folderId: Folder['id']
  projectId: Project['id']
  userId: User['id']
}) => {
  const [result] = await db
    .select()
    .from(folders)
    .innerJoin(projects, eq(projects.id, projectId))
    .where(and(eq(folders.id, folderId), eq(projects.userId, userId)))
  return result
}

export const getProjectFolderFiles = ({
  folderId,
  projectId,
  userId,
}: {
  folderId: Folder['id']
  projectId: Project['id']
  userId: User['id']
}) => {
  return db
    .select()
    .from(files)
    .where(
      and(
        eq(files.folderId, folderId),
        exists(
          db
            .select({ id: sql`TRUE` })
            .from(folders)
            .innerJoin(projects, eq(folders.projectId, projects.id))
            .innerJoin(users, eq(projects.userId, users.id))
            .where(
              and(
                eq(users.id, userId),
                eq(projects.id, projectId),
                eq(folders.id, folderId),
                isNull(files.deletedAt)
              )
            )
        )
      )
    )
    .orderBy(desc(files.createdAt))
}
