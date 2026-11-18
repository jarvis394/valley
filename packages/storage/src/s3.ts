import {
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  NoSuchKey,
  NotFound,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
  type S3ClientConfig,
} from '@aws-sdk/client-s3'
import { S3Store } from '@tus/s3-store'
import { assertKey, contentTypeFor, joinUrl } from './keys'
import type { ByteRange, Storage, StorageDriverName } from './types'

export interface S3StorageConfig {
  bucket: string
  region?: string
  /** Custom endpoint for S3-compatible services (MinIO, Backblaze B2, Garage…). */
  endpoint?: string
  accessKeyId: string
  secretAccessKey: string
  /** Address the bucket as `endpoint/bucket` instead of `bucket.endpoint`. MinIO needs it. */
  forcePathStyle?: boolean
  /** Base URL of a public bucket or a CDN in front of it. */
  publicUrl?: string
  keyPrefix?: string
  /** Bytes per multipart part of a tus upload. */
  partSize?: number
  /** Every non-trailing part must be exactly `partSize` (Cloudflare R2). */
  fixedPartSize?: boolean
}

const PART_SIZE = 8 * 1024 * 1024

const isNotFound = (error: unknown) =>
  error instanceof NoSuchKey ||
  error instanceof NotFound ||
  (error instanceof S3ServiceException && error.$metadata.httpStatusCode === 404)

/** AWS S3 and anything that speaks its API. The default driver. */
export class S3Storage implements Storage {
  readonly driver: StorageDriverName = 's3'
  readonly keyPrefix: string
  readonly #config: S3StorageConfig
  readonly #clientConfig: S3ClientConfig
  readonly #client: S3Client

  constructor(config: S3StorageConfig) {
    this.#config = config
    this.keyPrefix = config.keyPrefix ?? ''
    this.#clientConfig = {
      region: config.region ?? 'us-east-1',
      endpoint: config.endpoint,
      forcePathStyle: config.forcePathStyle,
      credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
      // Many S3-compatible services reject the newer default checksum headers.
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    }
    this.#client = new S3Client(this.#clientConfig)
  }

  async head(key: string) {
    try {
      const object = await this.#client.send(
        new HeadObjectCommand({ Bucket: this.#config.bucket, Key: assertKey(key) }),
      )

      return {
        size: object.ContentLength ?? 0,
        contentType: object.ContentType,
        lastModified: object.LastModified,
        etag: object.ETag,
      }
    } catch (error) {
      if (isNotFound(error)) return null
      throw error
    }
  }

  async read(key: string, range?: ByteRange) {
    try {
      const object = await this.#client.send(
        new GetObjectCommand({
          Bucket: this.#config.bucket,
          Key: assertKey(key),
          Range: range ? `bytes=${range.start}-${range.end}` : undefined,
        }),
      )
      if (!object.Body) return null
      const total = object.ContentRange?.split('/')[1]

      return {
        body: object.Body.transformToWebStream() as ReadableStream<Uint8Array>,
        size: total && total !== '*' ? Number(total) : (object.ContentLength ?? 0),
        contentType: object.ContentType,
        lastModified: object.LastModified,
        etag: object.ETag,
        range,
      }
    } catch (error) {
      if (isNotFound(error)) return null
      throw error
    }
  }

  async write(key: string, body: Uint8Array, options: { contentType?: string } = {}) {
    await this.#client.send(
      new PutObjectCommand({
        Bucket: this.#config.bucket,
        Key: assertKey(key),
        Body: body,
        ContentType: options.contentType ?? contentTypeFor(key),
      }),
    )
  }

  async delete(key: string) {
    await this.#client.send(
      new DeleteObjectsCommand({
        Bucket: this.#config.bucket,
        Delete: { Objects: [{ Key: assertKey(key) }], Quiet: true },
      }),
    )
  }

  async *list(prefix = '') {
    let token: string | undefined
    do {
      const page = await this.#client.send(
        new ListObjectsV2Command({
          Bucket: this.#config.bucket,
          Prefix: prefix,
          ContinuationToken: token,
        }),
      )
      for (const object of page.Contents ?? []) {
        if (object.Key) {
          yield { key: object.Key, size: object.Size ?? 0, lastModified: object.LastModified }
        }
      }
      token = page.IsTruncated ? page.NextContinuationToken : undefined
    } while (token)
  }

  publicUrl(key: string) {
    return this.#config.publicUrl ? joinUrl(this.#config.publicUrl, assertKey(key)) : null
  }

  tusStore() {
    const partSize = this.#config.partSize ?? PART_SIZE

    return new S3Store({
      partSize,
      minPartSize: this.#config.fixedPartSize ? partSize : undefined,
      useTags: false,
      s3ClientConfig: { ...this.#clientConfig, bucket: this.#config.bucket },
    })
  }

  tusSidecarKeys(key: string) {
    return [`${key}.info`]
  }
}
