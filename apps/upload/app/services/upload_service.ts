import FileService from '#services/file_service'
import {
  BaseTusHookResponseErrorBody,
  MAX_UPLOAD_FILE_SIZE,
  TusHookData,
  TusHookPreCreateResponse,
  TusHookPreFinishResponse,
  TusHookResponse,
  TusHookType,
} from '@valley/shared'
import { TusHookResponseBuilder } from '#lib/tus_hook_response_builder'
import deburr from 'lodash.deburr'
import { inject } from '@adonisjs/core'
import prisma from '#services/prisma_service'

@inject()
export default class UploadService {
  constructor(private readonly filesService: FileService) {}

  async handlePreCreateHook(data: TusHookData): Promise<TusHookResponse> {
    const fileSize = data.Event.Upload.Size
    const folderId = data.Event.Upload.MetaData['folder-id']
    const projectId = data.Event.Upload.MetaData['project-id']
    const userId = data.Event.Upload.MetaData['user-id']
    const uploadToken = data.Event.Upload.MetaData['upload-token']
    const uploadId = FileService.generateUploadId()
    const uploadPath = FileService.makeUploadPath({
      projectId,
      folderId,
      uploadId,
    })
    const resBuilder = new TusHookResponseBuilder<TusHookPreCreateResponse>()
      .setStatusCode(200)
      .setBody({
        ok: true,
        type: TusHookType.PRE_CREATE,
      })
      .setUploadPath(uploadPath)

    if (!uploadToken) {
      return resBuilder
        .setStatusCode(401)
        .setBody({
          ok: false,
          type: TusHookType.PRE_CREATE,
          statusCode: 401,
          message: 'No upload token found',
        })
        .build()
    }

    const uploadTokenFromDatabase = await prisma.uploadToken.findFirst({
      where: {
        hash: uploadToken,
        uploadFolderId: folderId,
        uploadProjectId: projectId,
        userId: userId,
      },
    })

    if (!uploadTokenFromDatabase) {
      return resBuilder
        .setStatusCode(401)
        .setBody({
          ok: false,
          type: TusHookType.PRE_CREATE,
          statusCode: 401,
          message: 'Invalid upload token',
        })
        .build()
    }

    const uploadFolder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        Project: {
          id: projectId,
          userId,
        },
      },
      select: {
        id: true,
        projectId: true,
      },
    })

    if (!uploadFolder) {
      return resBuilder
        .setStatusCode(404)
        .setBody({
          ok: false,
          type: TusHookType.PRE_CREATE,
          statusCode: 404,
          message: 'Upload folder not found',
        })
        .build()
    }

    if (fileSize > MAX_UPLOAD_FILE_SIZE) {
      return resBuilder
        .setStatusCode(400)
        .setBody({
          ok: false,
          type: TusHookType.PRE_CREATE,
          statusCode: 400,
          message: `File size is too big (max: ${MAX_UPLOAD_FILE_SIZE}, got: ${fileSize})`,
        })
        .build()
    }

    return resBuilder.build()
  }

  async handlePreFinishHook(data: TusHookData): Promise<TusHookResponse> {
    const {
      MetaData: metadata,
      Size: size,
      Storage: storage,
    } = data.Event.Upload
    const dateCreated = new Date()
    const resBuilder = new TusHookResponseBuilder<TusHookPreFinishResponse>()
      .setStatusCode(201)
      .setBody({
        ok: true,
        type: TusHookType.PRE_FINISH,
        folderId: metadata['folder-id'],
        size: size.toString(),
        key: storage.Key,
        bucket: storage.Bucket,
        name: deburr(metadata['normalized-name'].trim()),
        dateCreated: dateCreated.toISOString(),
        exifMetadata: {},
        id: data.Event.Upload.ID,
        uploadId: metadata['upload-id'],
        isPendingDeletion: false,
        contentType: metadata.type || 'application/octet-stream',
      })

    try {
      const file = await this.filesService.createFileForProjectFolder({
        id: resBuilder.body.id,
        folderId: resBuilder.body.folderId,
        key: resBuilder.body.key,
        size: resBuilder.body.size,
        name: resBuilder.body.name,
        type: metadata.type,
        bucket: resBuilder.body.bucket,
        projectId: metadata['project-id'],
        isPendingDeletion: false,
        dateCreated,
      })

      resBuilder.setBodyRecord('id', file.id)
      resBuilder.setBodyRecord('exifMetadata', file.exifMetadata)
      resBuilder.setBodyRecord('thumbnailKey', file.thumbnailKey)
      return resBuilder.build()
    } catch (e) {
      return new TusHookResponseBuilder<BaseTusHookResponseErrorBody>()
        .setRejectUpload(true)
        .setBody({
          ok: false,
          message: (e as Error).message,
          statusCode: 500,
          type: TusHookType.POST_FINISH,
        })
        .setStatusCode(500)
        .build()
    }
  }

  static defaultTusHandler(data: TusHookData): TusHookResponse {
    const res = new TusHookResponseBuilder()
      .setStatusCode(201)
      .setBody({
        ok: true,
        type: data.Type,
      })
      .build()

    return res
  }
}
