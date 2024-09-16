import { Injectable, NotFoundException } from '@nestjs/common'
import { File, Folder, Prisma, Project, User } from '@valley/db'
import {
  FolderCreateReq,
  FolderEditReq,
  SerializedFolder,
} from '@valley/shared'
import { PrismaService } from 'nestjs-prisma'
import { ProjectsService } from '../projects/projects.service'

@Injectable()
export class FoldersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly projectsService: ProjectsService
  ) {}

  serializeFolder(folder: Folder): SerializedFolder {
    return {
      ...folder,
      totalSize: Number(folder.totalSize),
    }
  }

  async folder(
    folderWhereUniqueInput: Prisma.FolderWhereUniqueInput
  ): Promise<Folder | null> {
    return await this.prismaService.folder.findUnique({
      where: folderWhereUniqueInput,
    })
  }

  async folders(params: {
    skip?: number
    take?: number
    cursor?: Prisma.FolderWhereUniqueInput
    where?: Prisma.FolderWhereInput
    orderBy?: Prisma.FolderOrderByWithRelationInput
  }): Promise<Folder[]> {
    const { skip, take, cursor, where, orderBy } = params
    return await this.prismaService.folder.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    })
  }

  async createFolder(data: Prisma.FolderCreateInput): Promise<Folder> {
    return await this.prismaService.folder.create({
      data,
    })
  }

  async updateFolder(params: {
    where: Prisma.FolderWhereUniqueInput
    data: Prisma.FolderUpdateInput
  }): Promise<Folder> {
    const { where, data } = params
    return await this.prismaService.folder.update({
      data,
      where,
    })
  }

  async deleteFolder(where: Prisma.FolderWhereUniqueInput): Promise<Folder> {
    return await this.prismaService.folder.delete({
      where,
    })
  }

  async getProjectFolders(
    projectId: Project['id']
  ): Promise<SerializedFolder[]> {
    const res = await this.folders({
      where: {
        projectId,
      },
      orderBy: {
        id: 'asc',
      },
    })

    return res.map((e) => this.serializeFolder(e))
  }

  async createProjectFolder(props: {
    userId: User['id']
    projectId: Project['id']
    data: FolderCreateReq
  }): Promise<SerializedFolder> {
    const project = await this.projectsService.project({
      id: props.projectId,
      userId: props.userId,
    })
    if (!project) {
      throw new NotFoundException('Project not found')
    }

    const folder = await this.createFolder({
      Project: {
        connect: {
          id: props.projectId,
        },
      },
      isDefaultFolder: false,
      title: props.data.title,
      description: props.data.description,
      files: {},
    })

    return this.serializeFolder(folder)
  }

  async createDefaultProjectFolder(props: {
    userId: User['id']
    projectId: Project['id']
  }): Promise<SerializedFolder> {
    const project = await this.projectsService.project({
      id: props.projectId,
      userId: props.userId,
    })
    if (!project) {
      throw new NotFoundException('Project not found')
    }

    const folder = await this.createFolder({
      Project: {
        connect: {
          id: props.projectId,
        },
      },
      isDefaultFolder: true,
      title: 'Default',
      description: null,
      files: {},
    })

    return this.serializeFolder(folder)
  }

  async editProjectFolder(props: {
    userId: User['id']
    projectId: Project['id']
    data: FolderEditReq
  }): Promise<SerializedFolder> {
    const { id, ...data } = props.data
    const project = await this.projectsService.project({
      id: props.projectId,
      userId: props.userId,
    })
    if (!project) {
      throw new NotFoundException('Project not found')
    }

    const folder = await this.updateFolder({
      where: {
        id,
        projectId: props.projectId,
      },
      data,
    })

    return this.serializeFolder(folder)
  }

  async addFileToFolder(
    folderId: Folder['id'],
    file: File
  ): Promise<SerializedFolder> {
    return await this.prismaService.$transaction(async (tx) => {
      const folder = await tx.folder.findFirst({
        where: { id: folderId },
      })
      const newFolderTotalSize = Number(folder.totalSize) + Number(file.size)
      const newFolderData = await tx.folder.update({
        where: { id: folderId },
        data: {
          totalFiles: {
            increment: 1,
          },
          totalSize: {
            set: newFolderTotalSize.toString(),
          },
        },
      })

      return this.serializeFolder(newFolderData)
    })
  }
}
