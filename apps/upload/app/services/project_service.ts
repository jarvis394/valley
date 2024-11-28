import { Project, File } from '@valley/db'
import type { SerializedProject } from '@valley/shared'
import prisma from '#services/prisma_service'

export default class ProjectService {
  async addFilesToProject(
    projectId: Project['id'],
    files: File[]
  ): Promise<SerializedProject | null> {
    return await prisma.$transaction(async (tx) => {
      const project = await tx.project.findFirst({
        where: { id: projectId },
      })

      if (!project) {
        return null
      }

      let allFilesSize = 0
      files.forEach((file) => {
        allFilesSize += Number(file.size)
      })

      const newProjectTotalSize = Number(project.totalSize) + allFilesSize
      const newProjectData = await tx.project.update({
        where: { id: projectId },
        data: {
          totalFiles: {
            increment: files.length,
          },
          totalSize: {
            set: newProjectTotalSize.toString(),
          },
        },
      })

      return ProjectService.serializeProject(newProjectData)
    })
  }

  async deleteFilesFromProject(
    projectId: Project['id'],
    files: File[]
  ): Promise<SerializedProject | null> {
    return await prisma.$transaction(async (tx) => {
      const project = await tx.project.findFirst({
        where: { id: projectId },
      })

      if (!project) {
        return null
      }

      let allFilesSize = 0
      files.forEach((file) => {
        allFilesSize += Number(file.size)
      })

      const newProjectTotalSize = Number(project.totalSize) - allFilesSize
      const newProjectData = await tx.project.update({
        where: { id: projectId },
        data: {
          totalFiles: {
            decrement: files.length,
          },
          totalSize: {
            set: newProjectTotalSize.toString(),
          },
        },
      })

      return ProjectService.serializeProject(newProjectData)
    })
  }

  static serializeProject(project: Project): SerializedProject {
    return {
      ...project,
      totalSize: Number(project.totalSize),
    }
  }
}
