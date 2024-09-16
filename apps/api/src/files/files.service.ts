import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { ConfigService } from '../config/config.service'
import { File, Folder, Prisma, Project } from '@valley/db'
import {
  GetObjectCommand,
  S3Client,
  GetObjectCommandOutput,
} from '@aws-sdk/client-s3'
import { MULTIPART_UPLOAD_CHUNK_SIZE, TusUploadMetadata } from '@valley/shared'
import { FoldersService } from '../folders/folders.service'
import { ProjectsService } from '../projects/projects.service'
import dec2frac from '../utils/dec2frac'
import sharp from 'sharp'
import exifr from 'exifr'
import { Upload } from '@aws-sdk/lib-storage'
import { IncomingMessage } from 'http'
import { Response } from 'express'

type ExifDataKey =
  | 'Artist'
  | 'Copyright'
  | 'DateTimeOriginal'
  | 'Make'
  | 'Model'
  | 'LensModel'
  | 'ExifImageWidth'
  | 'ExifImageHeight'
  | 'ExposureTime'
  | 'ISO'
  | 'FocalLength'
  | 'ApertureValue'
  | 'GPSLatitude'
  | 'GPSLongitude'
  | 'Flash'
  | 'FNumber'
  | 'Orientation'

type ExifData = Partial<Record<ExifDataKey, string | number>>
type ExifParsedData =
  | { ok: true; data: ExifData }
  | { ok: false; reason: string }

type ThumbnailCreationResult =
  | { ok: true; key: string }
  | { ok: false; reason: string }

const extractFields: ExifDataKey[] = [
  'Artist',
  'Copyright',
  'DateTimeOriginal',
  'Make',
  'Model',
  'LensModel',
  'ExifImageWidth',
  'ExifImageHeight',
  'ExposureTime',
  'ISO',
  'FocalLength',
  'ApertureValue',
  'GPSLatitude',
  'GPSLongitude',
  'Flash',
  'FNumber',
  'Orientation',
]

@Injectable()
export class FilesService {
  static readonly MAX_PROCESSING_SIZE = 1024 * 1024 * 100 // 100 MB
  static readonly THUMBNAIL_WIDTH = 320
  static readonly THUMBNAIL_QUALITY = 100
  static readonly THUMBNAIL_ALLOWED_CONTENT_TYPES = new Set([
    'image/png',
    'image/jpg',
    'image/jpeg',
  ])
  static readonly EXIF_PARSING_OPTIONS = {
    pick: extractFields,
  }
  static readonly THUMBNAIL_KEY = 'thumb_'
  readonly storage: S3Client

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly foldersService: FoldersService,
    private readonly projectsService: ProjectsService
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

  protected async createFile(data: Prisma.FileCreateInput): Promise<File> {
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

  /**
   * Extracts EXIF from image/file (supports RAW, JPEG, WEBP and PNG formats)
   * @param buffer Image binary data
   * @returns Parsed EXIF data
   */
  async extractExifData(image: Uint8Array): Promise<ExifParsedData> {
    let parsedExif: ExifData | null
    try {
      parsedExif = await exifr.parse(image, FilesService.EXIF_PARSING_OPTIONS)
    } catch (e) {
      if (e instanceof Error) {
        return { ok: false, reason: e.message }
      } else {
        return { ok: false, reason: 'Internal parsing error' }
      }
    }

    if (!parsedExif) {
      return { ok: false, reason: 'Parsed EXIF is empty' }
    }

    const res: ExifParsedData = { ok: true, data: {} }

    for (const key of Object.keys(parsedExif)) {
      const typedKey = key as ExifDataKey
      let value = parsedExif[typedKey]

      // Transform shutter speed to a fraction
      if (key === 'ExposureTime' && typeof value === 'number') {
        value = dec2frac(value)
      }

      // Shorten numbers to 3 digits
      if (typeof value == 'number') {
        value = Math.round(value * 100) / 100
      }

      if (value) {
        res.data[typedKey] = value
      }
    }

    return res
  }

  shouldProcessFileAsImage(object: GetObjectCommandOutput) {
    const thumbnailAllowed = this.shouldGenerateThumbnail(object.Metadata.type)
    const sizeAllowed = object.ContentLength <= FilesService.MAX_PROCESSING_SIZE
    return thumbnailAllowed && sizeAllowed
  }

  shouldGenerateThumbnail(type: string) {
    return FilesService.THUMBNAIL_ALLOWED_CONTENT_TYPES.has(type)
  }

  async createFileThumbnail(
    image: Uint8Array,
    data: { key: string; bucket: string; metadata: Record<string, string> }
  ): Promise<ThumbnailCreationResult> {
    const shouldGenerateThumbnail = this.shouldGenerateThumbnail(
      data.metadata.type
    )

    if (!shouldGenerateThumbnail) {
      return {
        ok: false,
        reason:
          'Thumbnail creation not supported for given file type, got: ' +
          data.metadata.type,
      }
    }

    const thumbnailKey = FilesService.getThumbnailKey(data.key)
    const thumbnailBuffer = await sharp(image)
      .withMetadata()
      .resize({
        fit: sharp.fit.contain,
        width: FilesService.THUMBNAIL_WIDTH,
      })
      .jpeg({
        quality: FilesService.THUMBNAIL_QUALITY,
      })
      .toBuffer()

    const parallelUploads3 = new Upload({
      client: this.storage,
      params: {
        Bucket: data.bucket,
        Key: thumbnailKey,
        Body: thumbnailBuffer,
        Metadata: data.metadata,
      },
      queueSize: 4,
      partSize: MULTIPART_UPLOAD_CHUNK_SIZE,
    })

    await parallelUploads3.done()

    return { ok: true, key: thumbnailKey }
  }

  async createFileForProjectFolder(
    data: Omit<File, 'id' | 'bucket' | 'exifMetadata' | 'thumbnailKey'> & {
      projectId: Project['id']
    }
  ): Promise<File> {
    const getObjectCommand = new GetObjectCommand({
      Bucket: this.configService.UPLOAD_BUCKET,
      Key: data.key,
    })
    const object = await this.storage.send(getObjectCommand)
    const fileData: Prisma.FileCreateInput = {
      Folder: {
        connect: {
          id: data.folderId,
        },
      },
      key: data.key,
      name: data.name,
      size: data.size,
      type: data.type,
      exifMetadata: {},
      // Files should always be saved in a default upload bucket
      bucket: this.configService.UPLOAD_BUCKET,
    }

    if (this.shouldProcessFileAsImage(object)) {
      const image = await object.Body.transformToByteArray()
      const exifMetadata = await this.extractExifData(image)
      const thumbnailResult = await this.createFileThumbnail(image, {
        key: data.key,
        bucket: this.configService.UPLOAD_BUCKET,
        metadata: object.Metadata,
      })
      fileData.exifMetadata = exifMetadata.ok ? exifMetadata.data : {}
      fileData.thumbnailKey = thumbnailResult.ok ? thumbnailResult.key : null
    }

    const databaseFile = await this.createFile(fileData)

    await this.foldersService.addFileToFolder(data.folderId, databaseFile)
    await this.projectsService.addFileToProject(data.projectId, databaseFile)

    return databaseFile
  }

  async streamFile(key: string, res: Response) {
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

      const fileStream = item.Body as IncomingMessage
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${metadata['normalized-name']}"`
      )
      res.setHeader('Content-Length', item.ContentLength.toString())
      res.setHeader('Content-Type', item.Metadata.type)
      fileStream.pipe(res)
    } catch (e) {
      throw new NotFoundException('File not found')
    }
  }

  static getThumbnailKey(key: string) {
    return FilesService.THUMBNAIL_KEY + key
  }

  static isThumbnail(key: string) {
    return key.startsWith(FilesService.THUMBNAIL_KEY)
  }
}
