import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { ConfigService } from '../config/config.service'
import { File, Folder, Prisma } from '@valley/db'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { TusUploadMetadata } from '@valley/shared'

@Injectable()
export class FilesService {
  readonly storage: S3Client

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService
  ) {
    this.storage = new S3Client({
      endpoint: configService.AWS_ENDPOINT,
      region: configService.AWS_REGION,
      forcePathStyle: true,
      credentials: {
        accessKeyId: configService.AWS_ACCESS_KEY_ID,
        secretAccessKey: configService.AWS_SECRET_ACCESS_KEY,
      },
    })
  }

  async file(
    fileWhereUniqueInput: Prisma.FileWhereUniqueInput
  ): Promise<File | null> {
    return await this.prismaService.file.findUnique({
      where: fileWhereUniqueInput,
    })
  }

  async files(params: {
    skip?: number
    take?: number
    cursor?: Prisma.FileWhereUniqueInput
    where?: Prisma.FileWhereInput
    orderBy?: Prisma.FileOrderByWithRelationInput
  }): Promise<File[]> {
    const { skip, take, cursor, where, orderBy } = params
    return this.prismaService.file.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    })
  }

  async createFile(data: Prisma.FileCreateInput): Promise<File> {
    return this.prismaService.file.create({
      data,
    })
  }

  async updateFile(params: {
    where: Prisma.FileWhereUniqueInput
    data: Prisma.FileUpdateInput
  }): Promise<File> {
    const { where, data } = params
    return this.prismaService.file.update({
      data,
      where,
    })
  }

  async deleteFile(where: Prisma.FileWhereUniqueInput): Promise<File> {
    return this.prismaService.file.delete({
      where,
    })
  }

  async getFolderFiles(folderId: Folder['id']): Promise<File[]> {
    return this.files({
      where: {
        folderId,
      },
    })
  }

  async streamFile(key: string): Promise<StreamableFile> {
    const command = new GetObjectCommand({
      Bucket: this.configService.UPLOAD_BUCKET,
      Key: key,
    })

    try {
      const item = await this.storage.send(command)
      const metadata = item.Metadata as TusUploadMetadata

      if (!item.Body) {
        throw new NotFoundException('File not found')
      }

      if (!metadata.type || !metadata['normalized-name']) {
        throw new InternalServerErrorException(
          'File is missing required metadata (type, normalilzed-name)'
        )
      }

      return new StreamableFile(await item.Body.transformToByteArray(), {
        type: item.Metadata.type,
        length: item.ContentLength,
        disposition: `inline; filename="${metadata['normalized-name']}"`,
      })
    } catch (e) {
      throw new NotFoundException('File not found')
    }
  }
}
