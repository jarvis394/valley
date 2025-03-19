import { db } from '../client.js'
import { eq } from 'drizzle-orm'
import { files, folders, projects, File } from '../schema/index.js'

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
