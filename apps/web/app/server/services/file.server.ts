import { db, File, files, folders, projects, User, users } from '@valley/db'
import { and, eq } from 'drizzle-orm'

export const getFileWithProjectAndFolder = async ({
  fileId,
}: {
  fileId: File['id']
}) => {
  const [result] = await db
    .select()
    .from(files)
    .leftJoin(folders, eq(folders.id, files.folderId))
    .leftJoin(projects, eq(projects.id, folders.projectId))
    .where(eq(files.id, fileId))
  return {
    file: result.files,
    project: result.projects,
    folder: result.folders,
  }
}

export const getFileWithUserProjectAndFolder = async ({
  userId,
  fileId,
}: {
  userId: User['id']
  fileId: File['id']
}) => {
  const [result] = await db
    .select()
    .from(files)
    .leftJoin(users, eq(users.id, userId))
    .leftJoin(folders, eq(folders.id, files.folderId))
    .leftJoin(projects, eq(projects.id, folders.projectId))
    .where(and(eq(users.id, userId), eq(files.id, fileId)))
  return {
    file: result.files,
    project: result.projects,
    folder: result.folders,
    user: result.users,
  }
}

export const getUserFile = async ({
  userId,
  fileId,
}: {
  userId: User['id']
  fileId: File['id']
}) => {
  const [result] = await db
    .select()
    .from(files)
    .leftJoin(users, eq(users.id, userId))
    .where(and(eq(users.id, userId), eq(files.id, fileId)))
  return result
}
