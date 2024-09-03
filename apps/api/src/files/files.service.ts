import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { ConfigService } from '../config/config.service'
import { File, Folder, Prisma, Project } from '@valley/db'
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { TusUploadMetadata } from '@valley/shared'
import { FoldersService } from '../folders/folders.service'
import { ProjectsService } from '../projects/projects.service'
import dec2frac from '../utils/dec2frac'
import sharp from 'sharp'
import exifr from 'exifr'

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

const extractFields = new Set<ExifDataKey>([
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
])

@Injectable()
export class FilesService {
  static THUMBNAIL_WIDTH = 320
  static THUMBNAIL_QUALITY = 100
  static THUMBNAIL_ALLOWED_CONTENT_TYPES = new Set([
    'image/png',
    'image/jpg',
    'image/jpeg',
  ])

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
  async extractExifData(buffer: Uint8Array): Promise<ExifParsedData> {
    let parsedExif: ExifData
    try {
      parsedExif = await exifr.parse(buffer)
    } catch (e) {
      if (e instanceof Error) {
        return { ok: false, reason: e.message }
      } else {
        return { ok: false, reason: 'Internal parsing error' }
      }
    }

    const res: ExifParsedData = { ok: true, data: {} }

    for (const key of Object.keys(parsedExif)) {
      const typedKey = key as ExifDataKey

      if (extractFields.has(typedKey)) {
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
          res[typedKey] = value
        }
      }
    }

    return res
  }

  async createFileThumbnail(
    image: Uint8Array,
    data: { key: string; bucket: string; metadata: Record<string, string> }
  ): Promise<ThumbnailCreationResult> {
    const shouldGenerateThumbnail =
      FilesService.THUMBNAIL_ALLOWED_CONTENT_TYPES.has(data.metadata.type)

    if (!shouldGenerateThumbnail) {
      return {
        ok: false,
        reason:
          'Thumbnail creation not supported for given file type, got: ' +
          data.metadata.type,
      }
    }

    const imageBuffer = await sharp(image)
      .resize({
        fit: sharp.fit.contain,
        width: FilesService.THUMBNAIL_WIDTH,
      })
      .jpeg({
        quality: FilesService.THUMBNAIL_QUALITY,
      })
      .toBuffer()

    const thumbnailKey = FilesService.getThumbnailKey(data.key)
    const putObjectCommand = new PutObjectCommand({
      Bucket: data.bucket,
      Key: thumbnailKey,
      Body: imageBuffer,
      Metadata: data.metadata,
    })
    await this.storage.send(putObjectCommand)

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
    const image = await object.Body.transformToByteArray()
    const exifMetadata = await this.extractExifData(image)
    const thumbnailResult = await this.createFileThumbnail(image, {
      key: data.key,
      bucket: this.configService.UPLOAD_BUCKET,
      metadata: object.Metadata,
    })
    const processedExifMetadata = exifMetadata.ok ? exifMetadata.data : null
    const processedThumbnailKey = thumbnailResult.ok
      ? thumbnailResult.key
      : null

    const file = await this.createFile({
      Folder: {
        connect: {
          id: data.folderId,
        },
      },
      key: data.key,
      name: data.name,
      size: data.size,
      type: data.type,
      exifMetadata: processedExifMetadata,
      thumbnailKey: processedThumbnailKey,
      // Files should always be saved in a default upload bucket
      bucket: this.configService.UPLOAD_BUCKET,
    })

    await this.foldersService.addFileToFolder(data.folderId, file)
    await this.projectsService.addFileToProject(data.projectId, file)

    return file
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

  static getThumbnailKey(key: string) {
    return key + '_320w'
  }
}
