import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '../config/config.service'
import { PrismaService } from 'nestjs-prisma'
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'
import { Prisma, Project, User } from '@prisma/client'

@Injectable()
export class ProjectsService {
  constructor(
    private readonly configService: ConfigService,
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
    orderBy?: Prisma.UserOrderByWithRelationInput
  }): Promise<Project[]> {
    const { skip, take, cursor, where, orderBy } = params
    return this.prismaService.project.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    })
  }

  async createProject(data: Prisma.ProjectCreateInput): Promise<Project> {
    return this.prismaService.project.create({
      data,
    })
  }

  async updateProject(params: {
    where: Prisma.ProjectWhereUniqueInput
    data: Prisma.ProjectUpdateInput
  }): Promise<Project> {
    const { where, data } = params
    return this.prismaService.project.update({
      data,
      where,
    })
  }

  async deleteProject(where: Prisma.ProjectWhereUniqueInput): Promise<Project> {
    return this.prismaService.project.delete({
      where,
    })
  }

  async getUserProjects(userId: User['id']): Promise<Project[]> {
    return this.projects({
      where: {
        userId,
      },
    })
  }

  async getUserProject(
    userId: User['id'],
    projectId: Project['id']
  ): Promise<Project> {
    const project = await this.project({
      id: projectId,
      userId,
    })

    if (!project) {
      throw new NotFoundException('Project not found')
    }

    return project
  }
}
