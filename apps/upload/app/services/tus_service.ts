import env from '#start/env'
import { DataStore, Server, ServerOptions } from '@tus/server'
import { GCSStore } from '@tus/gcs-store'
import { FileStore } from '@tus/file-store'
import { S3Store } from '@tus/s3-store'
import {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  GCS_KEY_FILENAME,
  GCS_PROJECT_ID,
} from '#config/drive'
import { Storage } from '@google-cloud/storage'
import type { Bucket } from '@google-cloud/storage'
import { ALLOWED_ORIGINS } from '#config/cors'
import FileService from '#services/file_service'
import {
  BaseTusHookResponseErrorBody,
  MAX_UPLOAD_FILE_SIZE,
  TusHookPreFinishResponse,
  TusHookType,
  TusUploadMetadata,
} from '@valley/shared'
import { inject } from '@adonisjs/core'
import { IncomingMessage } from 'node:http'
import deburr from 'lodash.deburr'
import { TusHookResponseBuilder } from '#lib/tus_hook_response_builder'
import { getProjectFolder } from '@valley/db'
import { auth } from '@valley/auth'

const gcsStorage = new Storage({
  keyFilename: GCS_KEY_FILENAME,
  projectId: GCS_PROJECT_ID,
})

@inject()
export default class TusService {
  constructor(private fileService: FileService) {}

  static TUS_ENDPOINT_PATH = '/api/storage'

  static getFileIdFromRequest(req: IncomingMessage, lastPath?: string) {
    return req.url?.replace(TusService.TUS_ENDPOINT_PATH + '/', '') || lastPath
  }

  static namingFunction(
    _req: IncomingMessage,
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
      // Type is wrong in @tus/gcs-store
      // @ts-expect-error
      bucket: gcsStorage.bucket(env.get('GCS_BUCKET')!) as Bucket,
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
        bucket: env.get('AWS_BUCKET')!,
        endpoint: env.get('AWS_ENDPOINT'),
        region: env.get('AWS_REGION'),
        forcePathStyle: true,
        credentials: {
          accessKeyId: AWS_ACCESS_KEY_ID || '',
          secretAccessKey: AWS_SECRET_ACCESS_KEY || '',
        },
      },
    })
  }

  makeTusServer() {
    const storageDriver = env.get('DRIVE_DISK')
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
      allowedOrigins: ALLOWED_ORIGINS,
      maxSize: MAX_UPLOAD_FILE_SIZE,
      namingFunction: TusService.namingFunction,
      getFileIdFromRequest: TusService.getFileIdFromRequest,
      onIncomingRequest: this.handleIncomingRequest?.bind(this),
      onUploadCreate: this.handlUploadCreate?.bind(this),
      onUploadFinish: this.handleUploadFinish?.bind(this),
    })
  }

  async getSessionFromRequest(req: IncomingMessage) {
    const headers = new Headers()
    Object.entries(req.headers).forEach((entry) => {
      const [key, value] = entry
      value && headers.append(key, value.toString())
    })
    const authCookie = encodeURIComponent(headers.get('authorization') || '')
    headers.set('Cookie', 'valley.session_token=' + authCookie)
    const session = await auth.api.getSession({
      headers,
    })

    if (!session) {
      throw new TusHookResponseBuilder<BaseTusHookResponseErrorBody>()
        .setStatusCode(401)
        .setBody({
          ok: false,
          message: 'Invalid session',
          statusCode: 401,
        })
        .build()
    }

    return session
  }

  handleIncomingRequest: ServerOptions['onIncomingRequest'] = async (
    req,
    res,
    _uploadId
  ) => {
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
      res.write(
        JSON.stringify({
          ok: false,
          statusCode: 401,
          message: 'Download is not allowed in Tus instance',
        })
      )
      res.end()
      return
    }
  }

  handlUploadCreate: ServerOptions['onUploadCreate'] = async (
    req,
    res,
    upload
  ) => {
    const session = await this.getSessionFromRequest(req)
    const metadata = upload.metadata as TusUploadMetadata

    if (!metadata) {
      throw { status_code: 400, message: 'No metadata found' }
    }

    const uploadFolder = await getProjectFolder({
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

    return {
      type: 'pre-create',
      upload,
      res,
    }
  }

  handleUploadFinish: ServerOptions['onUploadFinish'] = async (
    _req,
    res,
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
      const file = await this.fileService.createFileForProjectFolder({
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

      return { res, ...resBuilder.build() }
    } catch (e) {
      throw { status_code: 500, body: (e as Error).message }
    }
  }
}
