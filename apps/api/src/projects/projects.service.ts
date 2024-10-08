import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { ProjectCreateReq, SerializedProject } from '@valley/shared'
import { File, Project, User, Prisma } from '@valley/db'
import { UrlService } from 'src/lib/services/url.service'

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async project(
    projectWhereUniqueInput: Prisma.ProjectWhereUniqueInput
  ): Promise<Project | null> {
    return await this.prismaService.project.findUnique({
      where: projectWhereUniqueInput,
    })
  }

  async projects(params: {
    skip?: number
    take?: number
    cursor?: Prisma.ProjectWhereUniqueInput
    where?: Prisma.ProjectWhereInput
    orderBy?: Prisma.ProjectOrderByWithRelationInput
  }): Promise<Project[]> {
    const { skip, take, cursor, where, orderBy } = params
    return await this.prismaService.project.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    })
  }

  async createProject(data: Prisma.ProjectCreateInput): Promise<Project> {
    return await this.prismaService.project.create({
      data,
    })
  }

  async updateProject(params: {
    where: Prisma.ProjectWhereUniqueInput
    data: Prisma.ProjectUpdateInput
  }): Promise<Project> {
    const { where, data } = params
    return await this.prismaService.project.update({
      data,
      where,
    })
  }

  async deleteProject(where: Prisma.ProjectWhereUniqueInput): Promise<Project> {
    return await this.prismaService.project.delete({
      where,
    })
  }

  async getUserProjects(userId: User['id']): Promise<SerializedProject[]> {
    const projects = await this.projects({
      where: {
        userId,
      },
      orderBy: {
        id: 'asc',
      },
    })

    return projects.map((e) => ProjectsService.serializeProject(e))
  }

  async getUserProject(
    userId: User['id'],
    projectId: Project['id']
  ): Promise<SerializedProject> {
    const project = await this.project({
      id: projectId,
      userId,
    })

    if (!project) {
      throw new NotFoundException('Project not found')
    }

    return ProjectsService.serializeProject(project)
  }

  async createProjectForUser(
    data: ProjectCreateReq,
    userId: User['id']
  ): Promise<SerializedProject> {
    const project = await this.createProject({
      ...data,
      url: UrlService.generateURL(data.title),
      User: {
        connect: {
          id: userId,
        },
      },
    })

    return ProjectsService.serializeProject(project)
  }

  async addFilesToProject(
    projectId: Project['id'],
    files: File[]
  ): Promise<SerializedProject> {
    return await this.prismaService.$transaction(async (tx) => {
      const project = await tx.project.findFirst({
        where: { id: projectId },
      })
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

      return ProjectsService.serializeProject(newProjectData)
    })
  }

  static serializeProject(project: Project): SerializedProject {
    return {
      ...project,
      totalSize: Number(project.totalSize),
    }
  }
}
