import { Injectable } from '@nestjs/common'
import { Folder, Prisma, Project } from '@valley/db'
import { FolderCreateReq } from '@valley/shared'
import { PrismaService } from 'nestjs-prisma'

@Injectable()
export class FoldersService {
  constructor(private readonly prismaService: PrismaService) {}

  async folder(
    projectWhereUniqueInput: Prisma.FolderWhereUniqueInput
  ): Promise<Folder | null> {
    return await this.prismaService.folder.findUnique({
      where: projectWhereUniqueInput,
    })
  }

  async folders(params: {
    skip?: number
    take?: number
    cursor?: Prisma.FolderWhereUniqueInput
    where?: Prisma.FolderWhereInput
    orderBy?: Prisma.UserOrderByWithRelationInput
  }): Promise<Folder[]> {
    const { skip, take, cursor, where, orderBy } = params
    return this.prismaService.folder.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    })
  }

  async createFolder(data: Prisma.FolderCreateInput): Promise<Folder> {
    return this.prismaService.folder.create({
      data,
    })
  }

  async updateFolder(params: {
    where: Prisma.FolderWhereUniqueInput
    data: Prisma.FolderUpdateInput
  }): Promise<Folder> {
    const { where, data } = params
    return this.prismaService.folder.update({
      data,
      where,
    })
  }

  async deleteProject(where: Prisma.FolderWhereUniqueInput): Promise<Folder> {
    return this.prismaService.folder.delete({
      where,
    })
  }

  async getProjectFolders(projectId: Project['id']): Promise<Folder[]> {
    return this.folders({
      where: {
        projectId,
      },
    })
  }

  async createFolderForProject(
    projectId: Project['id'],
    data: FolderCreateReq
  ): Promise<Folder> {
    return this.createFolder({
      Project: {
        connect: {
          id: projectId,
        },
      },
      isDefaultFolder: false,
      title: data.title,
      description: data.description,
      files: {},
    })
  }

  async createDefaultFolderForProject(
    projectId: Project['id']
  ): Promise<Folder> {
    return this.createFolder({
      Project: {
        connect: {
          id: projectId,
        },
      },
      isDefaultFolder: true,
      title: 'Default',
      description: null,
      files: {},
    })
  }
}
