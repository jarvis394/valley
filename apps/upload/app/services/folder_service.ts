import { Folder, File } from '@valley/db'
import type { SerializedFolder } from '@valley/shared'
import prisma from '#services/prisma_service'

export default class FolderService {
  async addFilesToFolder(
    folderId: Folder['id'],
    files: File[]
  ): Promise<SerializedFolder | null> {
    return await prisma.$transaction(async (tx) => {
      const folder = await tx.folder.findFirst({
        where: { id: folderId },
      })

      if (!folder) {
        return null
      }

      let allFilesSize = 0
      files.forEach((file) => {
        allFilesSize += Number(file.size)
      })

      const newFolderTotalSize = Number(folder.totalSize) + allFilesSize
      const newFolderData = await tx.folder.update({
        where: { id: folderId },
        data: {
          totalFiles: {
            increment: files.length,
          },
          totalSize: {
            set: newFolderTotalSize.toString(),
          },
        },
      })

      return FolderService.serializeFolder(newFolderData)
    })
  }

  async deleteFilesFromFolder(
    folderId: Folder['id'],
    files: File[]
  ): Promise<SerializedFolder | null> {
    return await prisma.$transaction(async (tx) => {
      const folder = await tx.folder.findFirst({
        where: { id: folderId },
      })
      let allFilesSize = 0
      files.forEach((file) => {
        allFilesSize += Number(file.size)
      })

      if (!folder) {
        return null
      }

      const newFolderTotalSize = Number(folder.totalSize) - allFilesSize
      const newFolderData = await tx.folder.update({
        where: { id: folderId },
        data: {
          totalFiles: {
            decrement: files.length,
          },
          totalSize: {
            set: newFolderTotalSize.toString(),
          },
        },
      })

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
