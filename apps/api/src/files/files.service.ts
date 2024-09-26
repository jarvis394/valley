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
  DeleteObjectsCommand,
  ObjectIdentifier,
} from '@aws-sdk/client-s3'
import {
  FolderDeleteRes,
  MULTIPART_UPLOAD_CHUNK_SIZE,
  TusUploadMetadata,
} from '@valley/shared'
import { FoldersService } from '../folders/folders.service'
import { ProjectsService } from '../projects/projects.service'
import dec2frac from '../utils/dec2frac'
import sharp from 'sharp'
import exifr from 'exifr'
import { Upload } from '@aws-sdk/lib-storage'
import { IncomingMessage } from 'http'
import { Response } from 'express'
import { v4 as uuid } from 'uuid'

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
  static readonly THUMBNAIL_PREFIX = 'thumb_'
  static readonly PROJECT_PATH_PREFIX = 'project-'
  static readonly FOLDER_PATH_PREFIX = 'folder-'
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
    return await this.prismaService.file.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    })
  }

  protected async createFile(data: Prisma.FileCreateInput): Promise<File> {
    return await this.prismaService.file.create({
      data,
    })
  }

  async update(params: {
    where: Prisma.FileWhereUniqueInput
    data: Prisma.FileUpdateInput
  }): Promise<File> {
    const { where, data } = params
    return await this.prismaService.file.update({
      data,
      where,
    })
  }

  private async delete(where: Prisma.FileWhereUniqueInput): Promise<File> {
    return await this.prismaService.file.delete({
      where,
    })
  }

  private async deleteMany(
    where: Prisma.FileWhereInput
  ): Promise<Prisma.BatchPayload> {
    return await this.prismaService.file.deleteMany({
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

    const thumbnailKey = FilesService.makeThumbnailUploadPath(data.key)
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

    const upload = new Upload({
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

    await upload.done()

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

    await this.foldersService.addFilesToFolder(data.folderId, [databaseFile])
    await this.projectsService.addFilesToProject(data.projectId, [databaseFile])

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

  private async deleteFilesInS3(
    files: File[]
  ): Promise<Omit<FolderDeleteRes, 'ok'>> {
    const objects: ObjectIdentifier[] = []

    if (files.length === 0) return { deleted: [], errors: [] }

    files.forEach((file) => {
      objects.push({
        Key: file.key,
      })

      // Delete <key>.info object which is created by Tus
      objects.push({
        Key: file.key + '.info',
      })

      // Delete thumbnail for object
      if (file.thumbnailKey) {
        objects.push({
          Key: file.thumbnailKey,
        })
      }
    })

    const deleteFilesCommand = new DeleteObjectsCommand({
      Bucket: this.configService.UPLOAD_BUCKET,
      Delete: {
        Objects: objects,
      },
    })
    const res = await this.storage.send(deleteFilesCommand)

    return {
      deleted: res?.Deleted?.map((e) => e.Key) || [],
      errors:
        res?.Errors?.map((e) => ({
          code: e.Code || 500,
          message: e.Message || 'Error deleting a file',
          key: e.Key,
        })) || [],
    }
  }

  // private async deleteFileInS3(
  //   file: File
  // ): Promise<Omit<FolderDeleteRes, 'ok'>> {
  //   const objects: ObjectIdentifier[] = [
  //     {
  //       Key: file.key,
  //     },
  //     // Delete <key>.info object which is created by Tus
  //     {
  //       Key: file.key + '.info',
  //     },
  //   ]

  //   // Delete thumbnail for object
  //   if (file.thumbnailKey) {
  //     objects.push({
  //       Key: file.thumbnailKey,
  //     })
  //   }

  //   const deleteFilesCommand = new DeleteObjectCommand({
  //     Bucket: this.configService.UPLOAD_BUCKET,
  //     Key: file.key,
  //   })

  //   try {
  //     await this.storage.send(deleteFilesCommand)
  //     return {
  //       deleted: [file.key],
  //       errors: [],
  //     }
  //   } catch (e) {
  //     console.log(e)
  //     throw new InternalServerErrorException()
  //   }
  // }

  // async deleteFile(fileOrFileId: File | File['id']): Promise<{
  //   deleted?: string
  //   error?: {
  //     code: string | number
  //     message: string
  //     key: string
  //   }
  // }> {
  //   let file: File
  //   if (typeof fileOrFileId === 'number') {
  //     file = await this.file({ id: fileOrFileId })
  //   } else {
  //     file = fileOrFileId
  //   }

  //   await this.delete({ id: file.id })
  //   await this.foldersService.deleteFilesFromFolder(file.folderId, [file])
  //   const s3Result = await this.deleteFileInS3(file)

  //   return {
  //     deleted: s3Result.deleted[0],
  //     error: s3Result.errors[0],
  //   }
  // }

  /**
   * Deletes files from a folder by deleting them in storage and in DB,
   * and updating folder size as well.
   *
   * WARNING: Supports only deleting files from one folder
   */
  async deleteFiles(
    folderId: Folder['id'],
    files: File[]
  ): Promise<Omit<FolderDeleteRes, 'ok'>> {
    if (files.length === 0) return { deleted: [], errors: [] }

    const [_filesDeleteResult, _folderUpdateResult, s3Result] =
      await Promise.all([
        this.deleteMany({
          id: {
            in: files.map((file) => file.id),
          },
        }),
        this.foldersService.deleteFilesFromFolder(folderId, files),
        this.deleteFilesInS3(files),
      ])

    return s3Result
  }

  static getFilePathnameParts(filePath: string): {
    path: string
    filename: string
    projectId: Project['id'] | null
    folderId: Folder['id'] | null
  } {
    let lastPathSeparator = filePath.lastIndexOf('/')
    lastPathSeparator =
      lastPathSeparator < 0 ? filePath.length : lastPathSeparator
    const path = filePath.slice(0, lastPathSeparator)
    const filename = filePath.slice(lastPathSeparator + 1)
    const pathParts = path.split('/')
    let projectId: Project['id'] = null,
      folderId: Folder['id'] = null
    if (pathParts.length === 2) {
      projectId = Number(
        pathParts[0].slice(FilesService.PROJECT_PATH_PREFIX.length)
      )
      folderId = Number(
        pathParts[1].slice(FilesService.FOLDER_PATH_PREFIX.length)
      )
    }

    return { path, filename, projectId, folderId }
  }

  static makeThumbnailUploadPath(filePath: string) {
    const { filename, path } = FilesService.getFilePathnameParts(filePath)
    return path + '/' + FilesService.THUMBNAIL_PREFIX + filename
  }

  static getUploadProjectName(projectId: Project['id']) {
    return `${FilesService.PROJECT_PATH_PREFIX}${projectId}`
  }

  static getUploadFolderName(folderId: Folder['id']) {
    return `${FilesService.FOLDER_PATH_PREFIX}${folderId}`
  }

  static generateUploadId(): string {
    return uuid()
  }

  static makeUploadPath(props: {
    projectId: string | number
    folderId: string | number
    uploadId: string
  }): string {
    const projectName = FilesService.getUploadProjectName(
      Number(props.projectId)
    )
    const folderName = FilesService.getUploadFolderName(Number(props.folderId))
    return `${projectName}/${folderName}/${props.uploadId}`
  }

  static isThumbnail(fileKey: string) {
    return fileKey.startsWith(FilesService.THUMBNAIL_PREFIX)
  }
}
