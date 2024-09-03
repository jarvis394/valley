import { Injectable } from '@nestjs/common'
import {
  TusHookResponse,
  TusHookData,
  TusHookPreFinishResponse,
  TusHookPreCreateResponse,
  TusHookType,
  MAX_UPLOAD_FILE_SIZE,
} from '@valley/shared'
import { FilesService } from '../files/files.service'
import { FoldersService } from '../folders/folders.service'
import { TusHookResponseBuilder } from '../lib/TusHookResponseBuilder'
import deburr from 'lodash.deburr'

@Injectable()
export class UploadService {
  constructor(
    private readonly filesService: FilesService,
    private readonly foldersService: FoldersService
  ) {}

  async handlePreCreateHook(data: TusHookData): Promise<TusHookResponse> {
    const fileSize = data.Event.Upload.Size
    const resBuilder = new TusHookResponseBuilder<TusHookPreCreateResponse>()
      .setStatusCode(200)
      .setBody({
        ok: true,
        type: TusHookType.PRE_CREATE,
      })

    if (fileSize > MAX_UPLOAD_FILE_SIZE) {
      return resBuilder
        .setStatusCode(400)
        .setBody({
          ok: false,
          type: TusHookType.PRE_CREATE,
          statusCode: 400,
          message: `File size is too big (max: ${MAX_UPLOAD_FILE_SIZE})`,
        })
        .build()
    }

    const doesFolderExist = await this.foldersService.folder({
      id: Number(data.Event.Upload.MetaData?.['folder-id']) || -1,
    })

    if (!doesFolderExist) {
      return resBuilder
        .setStatusCode(404)
        .setBody({
          ok: false,
          type: TusHookType.PRE_CREATE,
          statusCode: 404,
          message: 'Folder not found',
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
    const resBuilder = new TusHookResponseBuilder<TusHookPreFinishResponse>()
      .setStatusCode(201)
      .setBody({
        ok: true,
        type: TusHookType.PRE_FINISH,
        projectId: Number(metadata['project-id']),
        folderId: Number(metadata['folder-id']),
        uploadId: metadata['upload-id'],
        size: size,
        originalKey: storage.Key,
        name: deburr(metadata.name),
        contentType: metadata.type,
      })

    const file = await this.filesService.createFileForProjectFolder({
      folderId: resBuilder.body.folderId,
      key: resBuilder.body.originalKey,
      size: resBuilder.body.size,
      name: resBuilder.body.name,
      type: resBuilder.body.contentType,
      projectId: resBuilder.body.projectId,
    })

    resBuilder.setBodyRecord('thumbnailKey', file.thumbnailKey)
    return resBuilder.build()
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
