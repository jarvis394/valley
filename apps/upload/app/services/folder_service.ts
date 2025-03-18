import { Folder, File, folders, eq } from '@valley/db'
import type { SerializedFolder } from '@valley/shared'
import db from '#services/database_service'

export default class FolderService {
  async addFilesToFolder(
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

  static serializeFolder(folder: Folder): SerializedFolder {
    return {
      ...folder,
      totalSize: Number(folder.totalSize),
    }
  }
}
