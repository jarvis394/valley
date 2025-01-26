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
import * as cookie from 'cookie'
import cookieSignature from 'cookie-signature'
import prisma from '#services/prisma_service'
import {
  BaseTusHookResponseErrorBody,
  MAX_UPLOAD_FILE_SIZE,
  TusHookPreFinishResponse,
  TusHookType,
  TusUploadMetadata,
} from '@valley/shared'
import { inject } from '@adonisjs/core'
import FolderService from '#services/folder_service'
import { IncomingMessage } from 'node:http'
import deburr from 'lodash.deburr'
import { TusHookResponseBuilder } from '#lib/tus_hook_response_builder'
import logger from '@adonisjs/core/services/logger'

const gcsStorage = new Storage({
  keyFilename: GCS_KEY_FILENAME,
  projectId: GCS_PROJECT_ID,
})

@inject()
export default class TusService {
  constructor(
    private fileService: FileService,
    private folderService: FolderService
  ) {}

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
    const cookies = cookie.parse(req.headers.cookie || '')
    logger.debug('tus: Reading session cookie from request', cookies)
    const encodedSession = cookieSignature.unsign(
      cookies['valley_session'] || '',
      env.get('SESSION_SECRET')
    )
    const errorMessage =
      new TusHookResponseBuilder<BaseTusHookResponseErrorBody>()
        .setStatusCode(401)
        .setBody({
          ok: false,
          message: 'Invalid session',
          statusCode: 401,
        })

    if (!encodedSession) {
      throw errorMessage.build()
    }

    let session: { sessionId: string } | null
    try {
      session = JSON.parse(
        Buffer.from(encodedSession, 'base64').toString('ascii')
      )
    } catch (e) {
      throw errorMessage
        .setBody({
          ok: false,
          message: 'Invalid session (cannot destructure body)',
          statusCode: 401,
        })
        .build()
    }

    logger.debug('tus: Decoded session:', encodedSession)

    if (!session) {
      throw errorMessage.build()
    }

    const dbSession = await prisma.session.findFirst({
      where: {
        id: session.sessionId,
      },
    })

    if (!dbSession || dbSession.expirationDate < new Date()) {
      throw errorMessage
        .setBody({
          ok: false,
          message: 'Invalid session (probably expired)',
          statusCode: 401,
        })
        .build()
    }

    return dbSession
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

    const uploadFolder = await this.folderService.folder({
      where: {
        id: metadata['folder-id'],
        Project: {
          id: metadata['project-id'],
          userId: session.userId,
        },
      },
      select: {
        id: true,
        projectId: true,
      },
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

    if (
      !upload ||
      !metadata ||
      !storage ||
      !size ||
      !storage.bucket ||
      !projectId ||
      !folderId
    ) {
      throw { status_code: 400, message: 'Missing fields in upload object' }
    }

    const resBuilder = new TusHookResponseBuilder<TusHookPreFinishResponse>()
      .setStatusCode(201)
      .setBody({
        ok: true,
        type: TusHookType.PRE_FINISH,
        folderId,
        projectId,
        size,
        key: storage.path,
        bucket: storage.bucket,
        name,
        dateCreated: dateCreated.toISOString(),
        exifMetadata: {},
        id: upload.id,
        contentType,
        isPendingDeletion: false,
      })

    try {
      const file = await this.fileService.createFileForProjectFolder({
        id: upload.id,
        type: contentType,
        bucket: storage.bucket,
        key: storage.path,
        isPendingDeletion: false,
        projectId,
        folderId,
        dateCreated,
        name,
        size,
      })

      resBuilder.setBodyRecord('exifMetadata', file.exifMetadata)
      resBuilder.setBodyRecord('thumbnailKey', file.thumbnailKey)
      return { res, ...resBuilder.build() }
    } catch (e) {
      throw { status_code: 500, body: (e as Error).message }
    }
  }
}
