import { DataStore, Server, ServerOptions } from '@tus/server'
import { GCSStore } from '@tus/gcs-store'
import { FileStore } from '@tus/file-store'
import { S3Store } from '@tus/s3-store'
import { Storage } from '@google-cloud/storage'
import type { Bucket } from '@google-cloud/storage'
import {
  BaseTusHookResponseErrorBody,
  MAX_UPLOAD_FILE_SIZE,
  TusHookPreFinishResponse,
  TusHookType,
  TusUploadMetadata,
} from '@valley/shared'
import deburr from 'lodash.deburr'
import { TusHookResponseBuilder } from 'app/server/utils/tus-hook-response-builder'
import { auth } from '@valley/auth'
import { FileService } from './file.server'
import { FolderService } from './folder.server'

const gcsStorage = new Storage({
  keyFilename: process.env.GCS_KEY_FILENAME,
  projectId: process.env.GCS_PROJECT_ID,
})

export class TusService {
  static TUS_ENDPOINT_PATH = '/api/storage'

  static getFileIdFromRequest(req: Request, lastPath?: string) {
    const url = new URL(req.url)
    return (
      url.pathname.replace(TusService.TUS_ENDPOINT_PATH + '/', '') || lastPath
    )
  }

  static namingFunction(
    _req: Request,
    metadata?: Record<string, string | null>
  ) {
    if (!metadata) return crypto.randomUUID()

    const typedMetadata = metadata as TusUploadMetadata

    return FileService.makeUploadPath({
      folderId: typedMetadata['folder-id'],
      projectId: typedMetadata['project-id'],
      uploadId: crypto.randomUUID(),
    })
  }

  static makeGCSStore() {
    return new GCSStore({
      bucket: gcsStorage.bucket(process.env.GCS_BUCKET!) as Bucket,
    })
  }

  static makeFSStore() {
    return new FileStore({
      directory: 'storage',
    })
  }

  static makeS3Store() {
    return new S3Store({
      useTags: false,
      s3ClientConfig: {
        // Fix for B2 storage (disables checksum header)
        requestChecksumCalculation: 'WHEN_REQUIRED',
        responseChecksumValidation: 'WHEN_REQUIRED',
        bucket: process.env.AWS_BUCKET!,
        endpoint: process.env.AWS_ENDPOINT,
        region: process.env.AWS_REGION,
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        },
      },
    })
  }

  makeTusServer() {
    const storageDriver = process.env.DRIVE_DISK
    let datastore: DataStore

    switch (storageDriver) {
      case 'gcs':
        datastore = TusService.makeGCSStore()
        break
      case 'fs':
        datastore = TusService.makeFSStore()
        break
      case 's3':
        datastore = TusService.makeS3Store()
        break
      default:
        throw new Error('Invalid storage driver, got: ' + storageDriver)
    }

    return new Server({
      path: TusService.TUS_ENDPOINT_PATH,
      datastore,
      allowedCredentials: true,
      respectForwardedHeaders: true,
      maxSize: MAX_UPLOAD_FILE_SIZE,
      namingFunction: TusService.namingFunction,
      getFileIdFromRequest: TusService.getFileIdFromRequest,
      onIncomingRequest: this.handleIncomingRequest?.bind(this),
      onUploadCreate: this.handleUploadCreate?.bind(this),
      onUploadFinish: this.handleUploadFinish?.bind(this),
    })
  }

  async getSessionFromRequest(req: Request) {
    const errorResponse =
      new TusHookResponseBuilder<BaseTusHookResponseErrorBody>()
        .setStatusCode(401)
        .setBody({
          ok: false,
          message: 'Invalid session',
          statusCode: 401,
        })
        .build()

    try {
      const session = await auth.api.getSession({
        headers: req.headers,
      })

      if (!session) {
        throw errorResponse
      }

      return session
    } catch (e) {
      throw errorResponse
    }
  }

  handleIncomingRequest: ServerOptions['onIncomingRequest'] = async (req) => {
    let operation: 'create' | 'upload' | 'download' | 'default'
    switch (req.method) {
      case 'POST':
        operation = 'create'
        break
      case 'PATCH':
        operation = 'upload'
        break
      case 'GET':
        operation = 'download'
        break
      default:
        operation = 'default'
        break
    }

    if (operation === 'default') return
    // Skip validation because it is done in the onUploadCreate hook
    if (operation === 'create' || operation === 'upload') return
    // Disable downloads
    if (operation === 'download') {
      throw new TusHookResponseBuilder<BaseTusHookResponseErrorBody>()
        .setStatusCode(401)
        .setBody({
          ok: false,
          message: 'Download is not allowed in Tus instance',
          statusCode: 401,
        })
        .build()
    }
  }

  handleUploadCreate: ServerOptions['onUploadCreate'] = async (req, upload) => {
    const session = await this.getSessionFromRequest(req)
    const metadata = upload.metadata as TusUploadMetadata

    if (!metadata) {
      throw { status_code: 400, message: 'No metadata found' }
    }

    const uploadFolder = await FolderService.getProjectFolder({
      folderId: metadata['folder-id'],
      projectId: metadata['project-id'],
      userId: session.user.id,
    })

    if (!uploadFolder) {
      throw { status_code: 401, message: 'Upload folder not found' }
    }

    if (upload.size && upload.size > MAX_UPLOAD_FILE_SIZE) {
      throw {
        status_code: 400,
        message: `File size is too big (max: ${MAX_UPLOAD_FILE_SIZE}, got: ${upload.size})`,
      }
    }

    return { metadata: upload.metadata }
  }

  handleUploadFinish: ServerOptions['onUploadFinish'] = async (
    _req,
    upload
  ) => {
    const { storage } = upload
    const metadata = upload.metadata as TusUploadMetadata
    const contentType = metadata?.type || 'application/octet-stream'
    const dateCreated = new Date()
    const folderId = metadata?.['folder-id']
    const projectId = metadata?.['project-id']
    const name = deburr(metadata?.['name']?.trim() || 'file')
    const size = upload.size?.toString()

    if (!upload || !metadata || !storage || !size || !projectId || !folderId) {
      throw { status_code: 400, message: 'Missing fields in upload object' }
    }

    // Means we are using FS store
    if (upload.storage && !upload.storage?.bucket) {
      upload.storage.path = upload.storage.path.replace('storage/', '')
    }

    const resBuilder = new TusHookResponseBuilder<TusHookPreFinishResponse>()
      .setStatusCode(201)
      .setBody({
        ok: true,
        type: TusHookType.PRE_FINISH,
        data: {
          folderId,
          projectId,
          size,
          path: storage.path,
          name,
          exif: {},
          id: '',
          contentType,
          deletedAt: null,
          canHaveThumbnails: false,
          createdAt: dateCreated,
          updatedAt: dateCreated,
        },
      })

    try {
      const file = await FileService.createFileForProjectFolder({
        contentType,
        path: storage.path,
        projectId,
        folderId,
        name,
        size,
      })

      // Add fields that can be returned after file creation
      resBuilder.setBodyRecord('data', {
        ...resBuilder.body.data,
        ...file,
      })

      return resBuilder.build()
    } catch (e) {
      throw { status_code: 500, body: (e as Error).message }
    }
  }
}

export const tusService = new TusService()
export const tusServer = tusService.makeTusServer()
