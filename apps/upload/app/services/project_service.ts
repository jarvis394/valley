import { Project, File, Cover } from '@valley/db'
import type { SerializedProject } from '@valley/shared'
import prisma from '#services/prisma_service'

export default class ProjectService {
  async addFilesToProject(
    projectId: Project['id'],
    files: File[]
  ): Promise<SerializedProject | null> {
    return await prisma.$transaction(async (tx) => {
      const [projectsQuery, projectCoverQuery] = await Promise.all([
        tx.$queryRaw<
          Project[]
        >`SELECT * FROM "Project" WHERE id=${projectId} FOR UPDATE`,
        tx.$queryRaw<
          Cover[]
        >`SELECT * FROM "Cover" WHERE projectId=${projectId}`,
      ])
      const project = projectsQuery[0]
      const projectCover = projectCoverQuery[0]

      if (!project) {
        return null
      }

      let cover: Cover | null = null
      if (!projectCover) {
        cover = await tx.cover.create({
          data: {
            fileId: files[0].id,
            projectId: project.id,
          },
        })
      }

      let allFilesSize = 0
      files.forEach((file) => {
        allFilesSize += Number(file.size)
      })

      const newProjectTotalSize = Number(project.totalSize) + allFilesSize
      const newProjectData = await tx.project.update({
        where: { id: projectId },
        data: {
          ...(cover && {
            coverImage: {
              connect: {
                id: cover.id,
              },
            },
          }),
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
      const query = await tx.$queryRaw<
        Project[]
      >`SELECT * FROM "Project" WHERE id=${projectId} FOR UPDATE`
      const project = query[0]

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
