import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { File, Folder, Prisma, Project, User } from '@valley/db'
import {
  // CreateFolderDto,
  FolderCreateReq,
  FolderEditReq,
  SerializedFolder,
} from '@valley/shared'
import { PrismaService } from 'nestjs-prisma'

@Injectable()
export class FoldersService {
  private logger: Logger

  constructor(
    private readonly prismaService: PrismaService
    // private readonly projectsService: ProjectsService
  ) {
    this.logger = new Logger('FoldersService')
  }

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

  async getProjectFolders(props: {
    projectId: Project['id']
    userId: User['id']
  }): Promise<SerializedFolder[]> {
    const res = await this.folders({
      where: {
        projectId: props.projectId,
        Project: {
          userId: props.userId,
        },
      },
      orderBy: {
        id: 'asc',
      },
    })

    return res.map((e) => this.serializeFolder(e))
  }

  async getProjectFolder(props: {
    projectId: Project['id']
    folderId: Folder['id']
    userId: User['id']
  }): Promise<SerializedFolder> {
    const folder = await this.folder({
      projectId: props.projectId,
      id: props.folderId,
      Project: {
        userId: props.userId,
      },
    })

    if (!folder) {
      throw new NotFoundException('Folder not found')
    }

    return this.serializeFolder(folder)
  }

  // async createProjectFolder(data: CreateFolderDto): Promise<SerializedFolder> {
  //   // const project = await this.projectsService.project({
  //   //   id: data.projectId,
  //   //   userId: data.userId,
  //   // })
  //   // if (!project) {
  //   //   throw new NotFoundException('Project not found')
  //   // }

  //   const folder = await this.createFolder({
  //     Project: {
  //       connect: {
  //         id: data.projectId,
  //       },
  //     },
  //     isDefaultFolder: false,
  //     title: data.title,
  //     description: data.description,
  //     files: {},
  //   })

  //   return this.serializeFolder(folder)
  // }

  async createDefaultProjectFolder(props: {
    userId: User['id']
    projectId: Project['id']
  }): Promise<SerializedFolder> {
    // const project = await this.projectsService.project({
    //   id: props.projectId,
    //   userId: props.userId,
    // })
    // if (!project) {
    //   throw new NotFoundException('Project not found')
    // }

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

    return await this.prismaService.$transaction(async (tx) => {
      const project = await tx.project.findFirst({
        where: {
          id: props.projectId,
          userId: props.userId,
        },
      })
      if (!project) {
        throw new NotFoundException('Project not found')
      }

      const folder = await tx.folder.findFirst({
        where: {
          id,
          projectId: props.projectId,
        },
      })
      if (!folder) {
        throw new NotFoundException('Folder not found')
      }

      try {
        const updatedFolder = await this.updateFolder({
          where: {
            id,
            projectId: props.projectId,
          },
          data,
        })
        return this.serializeFolder(updatedFolder)
      } catch (e) {
        this.logger.error(
          `Caught exception on updating project folder: ${(e as Error).message}`
        )
        this.logger.debug(`Got props: ${JSON.stringify(props)}`)
        throw new InternalServerErrorException(
          'Cannot update folder, try again later'
        )
      }
    })
  }

  async addFilesToFolder(
    folderId: Folder['id'],
    files: File[]
  ): Promise<SerializedFolder> {
    return await this.prismaService.$transaction(async (tx) => {
      const folder = await tx.folder.findFirst({
        where: { id: folderId },
      })
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

      return this.serializeFolder(newFolderData)
    })
  }

  async deleteFilesFromFolder(
    folderId: Folder['id'],
    files: File[]
  ): Promise<SerializedFolder> {
    return await this.prismaService.$transaction(async (tx) => {
      const folder = await tx.folder.findFirst({
        where: { id: folderId },
      })
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

      return this.serializeFolder(newFolderData)
    })
  }
}
