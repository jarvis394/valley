import { Folder, File } from '@valley/db'
import type { SerializedFolder } from '@valley/shared'
import prisma from '#services/prisma_service'

export default class FolderService {
  async addFilesToFolder(
    folderId: Folder['id'],
    files: File[]
  ): Promise<SerializedFolder | null> {
    return await prisma.$transaction(async (tx) => {
      const query = await tx.$queryRaw<
        Folder[]
      >`SELECT * FROM "Folder" WHERE id=${folderId} FOR UPDATE`
      const folder = query[0]

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
      const query = await tx.$queryRaw<
        Folder[]
      >`SELECT * FROM "Folder" WHERE id=${folderId} FOR UPDATE`
      const folder = query[0]

      if (!folder) {
        return null
      }

      let allFilesSize = 0
      files.forEach((file) => {
        allFilesSize += Number(file.size)
      })

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
