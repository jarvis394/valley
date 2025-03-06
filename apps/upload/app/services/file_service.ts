import { inject } from '@adonisjs/core'
import { Response } from '@adonisjs/http-server'
import { Folder, Prisma, Project, File } from '@valley/db'
import { v4 as uuid } from 'uuid'
import prisma from '#services/prisma_service'
import ImageService from '#services/image_service'
import FolderService from '#services/folder_service'
import ProjectService from '#services/project_service'
import drive from '@adonisjs/drive/services/main'
import { errors } from 'flydrive'
import contentDisposition from 'content-disposition'
import logger from '@adonisjs/core/services/logger'

type FileData = Omit<
  File,
  | 'id'
  | 'canHaveThumbnails'
  | 'isPendingDeletion'
  | 'exifMetadata'
  | 'width'
  | 'height'
> & {
  id?: File['id']
  projectId: Project['id']
}

@inject()
export default class FileService {
  static readonly IMAGE_ALLOWED_CONTENT_TYPES = new Set([
    'image/png',
    'image/jpg',
    'image/jpeg',
  ])
  static readonly MAX_PROCESSING_SIZE = 1024 * 1024 * 100 // 100 MB
  static readonly PROJECT_PATH_PREFIX = 'project-'
  static readonly FOLDER_PATH_PREFIX = 'folder-'

  constructor(
    private readonly imageService: ImageService,
    private readonly folderService: FolderService,
    private readonly projectService: ProjectService
  ) {}

  async file(args: Prisma.FileFindFirstArgs): Promise<File | null> {
    return await prisma.file.findFirst(args)
  }

  async files(args: Prisma.FileFindManyArgs): Promise<File[]> {
    return await prisma.file.findMany(args)
  }

  async createFile(data: Prisma.FileCreateInput): Promise<File> {
    return await prisma.file.create({ data })
  }

  async update(params: {
    where: Prisma.FileWhereUniqueInput
    data: Prisma.FileUpdateInput
  }): Promise<File> {
    return await prisma.file.update(params)
  }

  async delete(where: Prisma.FileWhereUniqueInput): Promise<File> {
    return await prisma.file.delete({ where })
  }

  async deleteMany(where: Prisma.FileWhereInput): Promise<Prisma.BatchPayload> {
    return await prisma.file.deleteMany({ where })
  }

  shouldProcessFileAsImage(data: FileData) {
    const isImage = FileService.IMAGE_ALLOWED_CONTENT_TYPES.has(data.type)
    const sizeAllowed = Number(data.size) <= FileService.MAX_PROCESSING_SIZE
    return isImage && sizeAllowed
  }

  async createFileForProjectFolder(data: FileData): Promise<File> {
    if (!data.folderId) {
      throw new Error('createFileForProjectFolder: Folder ID is null')
    }

    const fileData: Prisma.FileCreateInput = {
      Folder: { connect: { id: data.folderId } },
      key: data.key,
      name: data.name,
      size: data.size,
      // Set default file type if not present
      type: data.type || 'application/octet-stream',
      exifMetadata: {},
      bucket: data.bucket,
    }

    if (this.shouldProcessFileAsImage(data)) {
      const { exif, metadata } = await this.imageService.parseImage(data.key)

      if (exif.ok) {
        fileData.exifMetadata = exif.data
      } else {
        logger.warn('Could not parse image EXIF: ' + exif.reason)
      }

      if (metadata.ok) {
        fileData.width = metadata.data.width
        fileData.height = metadata.data.height
        // API can only generate nice thumbnails when image dimensions are present
        fileData.canHaveThumbnails = true
      } else {
        logger.warn('Could not parse image metadata: ' + metadata.reason)
      }
    }

    const databaseFile = await this.createFile(fileData)

    await Promise.all([
      this.folderService.addFilesToFolder(data.folderId, [databaseFile]),
      this.projectService.addFilesToProject(data.projectId, [databaseFile]),
    ])

    return databaseFile
  }

  async streamFile(key: string, res: Response) {
    const parts = FileService.getFilePathnameParts(key)
    if (!parts.filename || !parts.projectId || !parts.folderId) {
      return res.badRequest('File path parts are missing')
    }

    const parsedKey = FileService.makeUploadPath({
      projectId: parts.projectId,
      folderId: parts.folderId,
      uploadId: parts.filename,
    })

    const databaseFile = await this.file({
      where: {
        key: parsedKey,
        folderId: parts.folderId,
        Folder: { projectId: parts.projectId },
      },
      select: { name: true, size: true, type: true },
    })
    const disk = drive.use()

    if (!databaseFile) return res.notFound('File not found')

    try {
      const metadata = await disk.getMetaData(key)
      const data = await disk.getStream(key)

      if (!data) {
        return res.notFound('File not found on disk')
      }

      res.header(
        'Content-Disposition',
        contentDisposition(databaseFile.name, { type: 'inline' })
      )
      res.header('Content-Length', metadata.contentLength)
      res.header(
        'Content-Type',
        metadata.contentType || 'application/octet-stream'
      )
      res.header('Cache-Control', 'public, max-age=31536000, immutable')
      res.header('Etag', metadata.etag)
      res.stream(data)
    } catch (e) {
      if (e instanceof errors.E_CANNOT_READ_FILE) {
        return res.internalServerError('Cannot read file, try again later')
      }
      if (e instanceof errors.E_CANNOT_GET_METADATA) {
        return res.notFound('File not found')
      }

      return res.internalServerError(e)
    }
  }

  async deleteFileFromStorage(key: string) {
    const disk = drive.use()

    try {
      await disk.delete(key)
      return { ok: true }
    } catch (e) {
      return { ok: false, message: (e as Error).message }
    }
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
    let projectId: Project['id'] | null = null
    let folderId: Folder['id'] | null = null

    if (pathParts.length === 2) {
      projectId = pathParts[0].slice(FileService.PROJECT_PATH_PREFIX.length)
      folderId = pathParts[1].slice(FileService.FOLDER_PATH_PREFIX.length)
    }

    return { path, filename, projectId, folderId }
  }

  static getUploadProjectName(projectId: Project['id']) {
    return `${FileService.PROJECT_PATH_PREFIX}${projectId}`
  }

  static getUploadFolderName(folderId: Folder['id']) {
    return `${FileService.FOLDER_PATH_PREFIX}${folderId}`
  }

  static generateUploadId(): string {
    return uuid()
  }

  static makeUploadPath(props: {
    projectId: string
    folderId: string
    uploadId: string
  }): string {
    const projectName = FileService.getUploadProjectName(props.projectId)
    const folderName = FileService.getUploadFolderName(props.folderId)
    return `${projectName}/${folderName}/${props.uploadId}`
  }
}
