import { Readable } from 'node:stream'
import { buffer } from 'node:stream/consumers'
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { Injectable, Logger } from '@nestjs/common'
import exifr from 'exifr'
import sharp from 'sharp'
import { ConfigService } from '../config/config.service'
import dec2frac from '../utils/dec2frac'
import {
  TusHookResponse,
  TusHookData,
  TusHookPreFinishResponse,
  BaseTusHookResponseBody,
  TusHookPreCreateResponse,
  TusHookType,
} from '@valley/shared'
import { FilesService } from 'src/files/files.service'
import { FoldersService } from 'src/folders/folders.service'
import { ProjectsService } from 'src/projects/projects.service'
import deburr from 'lodash.deburr'

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
  | (ExifData & { parsed: true })
  | { parsed: false; reason: string }

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

export class TusHookResponseBuilder<
  ResBody extends Record<
    string,
    string | number | boolean
  > = BaseTusHookResponseBody
> {
  private readonly data: TusHookResponse
  #body: ResBody = { ok: true } as unknown as ResBody

  get body(): ResBody {
    return this.#body
  }

  constructor() {
    this.data = {
      HTTPResponse: {
        StatusCode: 200,
        Body: JSON.stringify(this.body),
        Header: {
          'Content-Type': 'application/json',
        },
      },
    }
  }

  private stringifyBody() {
    this.data.HTTPResponse.Body = JSON.stringify(this.#body)
    return this
  }

  setStatusCode(code: number) {
    this.data.HTTPResponse.StatusCode = code
    return this
  }

  setBody(data: ResBody) {
    this.#body = data
    this.stringifyBody()
    return this
  }

  setBodyRecord(key: keyof ResBody, value: ResBody[keyof ResBody]) {
    this.#body[key] = value
    this.stringifyBody()
    return this
  }

  setRejectUpload(state: boolean) {
    this.data.RejectUpload = state
    return this
  }

  build(): TusHookResponse {
    return this.data
  }
}

@Injectable()
export class UploadService {
  static MAX_UPLOAD_SIZE = 1024 * 1024 * 100
  static THUMBNAIL_ALLOWED_CONTENT_TYPES = new Set([
    'image/png',
    'image/jpg',
    'image/jpeg',
  ])

  private logger = new Logger('UploadService')
  readonly storage: S3Client

  constructor(
    private readonly configService: ConfigService,
    private readonly filesService: FilesService,
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

  /**
   * Extracts EXIF from image/file (supports RAW, JPEG, WEBP and PNG formats)
   * @param buffer Image binary data
   * @returns Parsed EXIF data
   */
  async extractExifData(buffer: Buffer): Promise<ExifParsedData> {
    let parsedExif: ExifData
    try {
      parsedExif = await exifr.parse(buffer)
    } catch (e) {
      if (e instanceof Error) {
        return { parsed: false, reason: e.message }
      } else {
        return { parsed: false, reason: 'Internal parsing error' }
      }
    }

    const res: ExifParsedData = { parsed: true }

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

  async generateThumbnail(upload: TusHookData['Event']['Upload']) {
    const getObjectCommand = new GetObjectCommand({
      Bucket: upload.Storage.Bucket,
      Key: upload.Storage.Key,
    })
    const object = await this.storage.send(getObjectCommand)

    if (object.Body instanceof Readable) {
      const fileBuffer = await buffer(object.Body)
      const imageBuffer = await sharp(fileBuffer)
        .resize({
          fit: sharp.fit.contain,
          width: 320,
        })
        .jpeg({
          quality: 100,
        })
        .toBuffer()

      const putObjectCommand = new PutObjectCommand({
        Bucket: upload.Storage.Bucket,
        Key: upload.Storage.Key + '_320w',
        Body: imageBuffer,
        Metadata: object.Metadata,
      })
      await this.storage.send(putObjectCommand)
    }

    return upload.Storage.Key + '_320w'
  }

  async addFileToDatabase(data: TusHookPreFinishResponse) {
    // TODO: this.extractExifData()
    const exifMetadata = {}

    const file = await this.filesService.createFile({
      Folder: {
        connect: {
          id: data.folderId,
        },
      },
      bucket: this.configService.UPLOAD_BUCKET,
      key: data.originalKey,
      thumbnailKey: data.thumbnailKey,
      size: data.size,
      name: data.name,
      type: data.contentType,
      exifMetadata,
    })

    await this.foldersService.addFileToFolder(data.folderId, file)
    await this.projectsService.addFileToProject(data.projectId, file)
  }

  async handlePreCreateHook(data: TusHookData): Promise<TusHookResponse> {
    const fileSize = data.Event.Upload.Size
    const resBuilder = new TusHookResponseBuilder<TusHookPreCreateResponse>()
      .setStatusCode(200)
      .setBody({
        ok: true,
        type: TusHookType.PRE_CREATE,
      })

    if (fileSize > UploadService.MAX_UPLOAD_SIZE) {
      return resBuilder
        .setStatusCode(400)
        .setBody({
          ok: false,
          type: TusHookType.PRE_CREATE,
          statusCode: 400,
          message: `File size is too big (max: ${UploadService.MAX_UPLOAD_SIZE})`,
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

  async handlePreFinishHook(data: TusHookData) {
    const metadata = data.Event.Upload.MetaData
    const shouldGenerateThumbnail =
      UploadService.THUMBNAIL_ALLOWED_CONTENT_TYPES.has(metadata.type)
    const resBuilder = new TusHookResponseBuilder<TusHookPreFinishResponse>()
      .setStatusCode(201)
      .setBody({
        ok: true,
        type: TusHookType.PRE_FINISH,
        projectId: Number(metadata['project-id']),
        folderId: Number(metadata['folder-id']),
        uploadId: metadata['upload-id'],
        size: data.Event.Upload.Size,
        originalKey: data.Event.Upload.Storage.Key,
        name: deburr(metadata.name),
        contentType: metadata.type,
      })

    if (shouldGenerateThumbnail) {
      const thumbnailKey = await this.generateThumbnail(data.Event.Upload)
      resBuilder.setBodyRecord('thumbnailKey', thumbnailKey)
    }

    await this.addFileToDatabase(resBuilder.body)

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

    console.log('Default tus handler:', data.Type, res)
    return res
  }
}
