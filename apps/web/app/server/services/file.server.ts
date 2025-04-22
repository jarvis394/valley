import {
  db,
  File,
  files,
  folders,
  projects,
  User,
  users,
  and,
  eq,
  Project,
  Folder,
} from '@valley/db'
import { v4 as uuid } from 'uuid'
import { ImageService } from './image.server'
import { ProjectService } from './project.server'
import { FolderService } from './folder.server'
import { disk } from './drive.server'
import { createReadableStreamFromReadable } from '@react-router/node'
import { errors } from 'flydrive'

export type FileData = Omit<
  File,
  | 'exif'
  | 'width'
  | 'height'
  | 'canHaveThumbnails'
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
> & {
  projectId: Project['id']
  exif?: File['exif']
  width?: File['width']
  height?: File['height']
  canHaveThumbnails?: File['canHaveThumbnails']
}

export class FileService {
  static readonly IMAGE_ALLOWED_CONTENT_TYPES = new Set([
    'image/png',
    'image/jpg',
    'image/jpeg',
  ])
  static readonly MAX_PROCESSING_SIZE = 1024 * 1024 * 100 // 100 MB
  static readonly PROJECT_PATH_PREFIX = 'project-'
  static readonly FOLDER_PATH_PREFIX = 'folder-'

  static async getWithUserProjectAndFolder({
    userId,
    fileId,
  }: {
    userId: User['id']
    fileId: File['id']
  }) {
    const [result] = await db
      .select()
      .from(files)
      .leftJoin(users, eq(users.id, userId))
      .leftJoin(folders, eq(folders.id, files.folderId))
      .leftJoin(projects, eq(projects.id, folders.projectId))
      .where(and(eq(users.id, userId), eq(files.id, fileId)))
    return {
      file: result.files,
      project: result.projects,
      folder: result.folders,
      user: result.users,
    }
  }

  static async getUserFile({
    userId,
    fileId,
  }: {
    userId: User['id']
    fileId: File['id']
  }) {
    const [result] = await db
      .select()
      .from(files)
      .leftJoin(users, eq(users.id, userId))
      .where(and(eq(users.id, userId), eq(files.id, fileId)))
    return result
  }

  static shouldProcessFileAsImage(data: FileData) {
    const isImage =
      data.contentType &&
      FileService.IMAGE_ALLOWED_CONTENT_TYPES.has(data.contentType)
    const sizeAllowed = Number(data.size) <= FileService.MAX_PROCESSING_SIZE
    return isImage && sizeAllowed
  }

  static async createFileForProjectFolder(data: FileData): Promise<File> {
    if (!data.folderId) {
      throw new Error('createFileForProjectFolder: Folder ID is null')
    }

    const fileData: FileData = {
      ...data,
      // Set default file type if not present
      contentType: data.contentType || 'application/octet-stream',
    }

    if (FileService.shouldProcessFileAsImage(data)) {
      const { exif, metadata } = await ImageService.parseImage(data.path)

      if (exif.ok) {
        fileData.exif = exif.data
      } else {
        console.warn('Could not parse image EXIF: ' + exif.reason)
      }

      if (metadata.ok) {
        fileData.width = metadata.data.width || null
        fileData.height = metadata.data.height || null
        // API can only generate nice thumbnails when image dimensions are present
        fileData.canHaveThumbnails = true
      } else {
        console.warn('Could not parse image metadata: ' + metadata.reason)
      }
    }

    const [databaseFile] = await db.insert(files).values(fileData).returning()

    await Promise.all([
      FolderService.addFilesToFolder(data.folderId, [databaseFile]),
      ProjectService.addFilesToProject(data.projectId, [databaseFile]),
    ])

    return databaseFile
  }

  static async streamFile(path: string) {
    const parts = FileService.getFilePathnameParts(path)
    if (!parts.filename || !parts.projectId || !parts.folderId) {
      throw new Response('Not Found', {
        status: 404,
      })
    }

    // TODO: check for project protected status
    const [result] = await db
      .select()
      .from(files)
      .where(eq(files.path, path))
      .leftJoin(projects, eq(projects.id, parts.projectId))
    const file = result?.files

    // File can be pending deletion (`file.deletedAt` !== null), it is considered missing if so
    if (!file || file.deletedAt) {
      throw new Response('Not Found', {
        status: 404,
      })
    }

    try {
      const [metadata, data] = await Promise.all([
        disk.getMetaData(path),
        disk.getStream(path),
      ])
      const readable = createReadableStreamFromReadable(data)

      return {
        file,
        metadata,
        readable,
      }
    } catch (e) {
      if (e instanceof errors.E_CANNOT_READ_FILE) {
        throw new Response('Cannot read file, try again later', {
          status: 500,
        })
      }
      if (e instanceof errors.E_CANNOT_GET_METADATA) {
        throw new Response('Cannot get file metadata', {
          status: 404,
        })
      }

      throw new Response((e as Error).message, {
        status: 500,
      })
    }
  }

  static async deleteFromStorageByPath(path: string) {
    try {
      // Deletes file and .info Tus metadata
      await disk.deleteAll(path)
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
