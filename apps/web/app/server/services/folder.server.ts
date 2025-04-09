import {
  db,
  files,
  folders,
  projects,
  users,
  and,
  desc,
  eq,
  exists,
  isNull,
  sql,
  type Folder,
  type Project,
  type User,
  File,
} from '@valley/db'
import { SerializedFolder } from '@valley/shared'

export class FolderService {
  static async getProjectFolder({
    folderId,
    projectId,
    userId,
  }: {
    folderId: Folder['id']
    projectId: Project['id']
    userId: User['id']
  }) {
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

  static async getProjectFolderAndProject({
    folderId,
    projectId,
    userId,
  }: {
    folderId: Folder['id']
    projectId: Project['id']
    userId: User['id']
  }) {
    const [result] = await db
      .select()
      .from(folders)
      .innerJoin(projects, eq(projects.id, projectId))
      .where(and(eq(folders.id, folderId), eq(projects.userId, userId)))
    return result
  }

  static getProjectFolderFiles({
    folderId,
    projectId,
    userId,
  }: {
    folderId: Folder['id']
    projectId: Project['id']
    userId: User['id']
  }) {
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

  static serializeFolder(folder: Folder): SerializedFolder {
    return {
      ...folder,
      totalSize: Number(folder.totalSize),
    }
  }

  static async addFilesToFolder(
    folderId: Folder['id'],
    files: File[]
  ): Promise<SerializedFolder | null> {
    return await db.transaction(async (tx) => {
      const [folder] = await tx
        .select()
        .from(folders)
        .where(eq(folders.id, folderId))
        .for('update')

      if (!folder) {
        return null
      }

      let allFilesSize = 0
      files.forEach((file) => {
        allFilesSize += Number(file.size)
      })

      const newFolderTotalFiles = folder.totalFiles + files.length
      const newFolderTotalSize = Number(folder.totalSize) + allFilesSize
      const [newFolderData] = await tx
        .update(folders)
        .set({
          totalFiles: newFolderTotalFiles,
          totalSize: newFolderTotalSize.toString(),
        })
        .where(eq(folders.id, folderId))
        .returning()

      return FolderService.serializeFolder(newFolderData)
    })
  }
}
