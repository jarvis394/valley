import { S3Storage } from './s3'
import type { StorageDriverName } from './types'

export interface R2StorageConfig {
  accountId: string
  bucket: string
  accessKeyId: string
  secretAccessKey: string
  /** EU or FedRAMP buckets live on a jurisdiction-specific endpoint. */
  jurisdiction?: 'eu' | 'fedramp'
  /** The bucket's r2.dev URL or a custom domain bound to it. */
  publicUrl?: string
  keyPrefix?: string
}

/** Cloudflare R2, through its S3-compatible API. */
export class R2Storage extends S3Storage {
  override readonly driver: StorageDriverName = 'r2'

  constructor({ accountId, jurisdiction, ...config }: R2StorageConfig) {
    const host = jurisdiction ? `${accountId}.${jurisdiction}` : accountId
    super({
      ...config,
      endpoint: `https://${host}.r2.cloudflarestorage.com`,
      region: 'auto',
      fixedPartSize: true,
    })
  }
}
