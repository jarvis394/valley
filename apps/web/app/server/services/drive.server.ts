import { Disk } from 'flydrive'
import { FSDriver } from 'flydrive/drivers/fs'
import { GCSDriver } from 'flydrive/drivers/gcs'
import { S3Driver } from 'flydrive/drivers/s3'
import { S3Client } from '@aws-sdk/client-s3'

export const s3Client = new S3Client({
  endpoint: process.env.AWS_ENDPOINT,
  region: process.env.AWS_REGION,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

export const S3_SERVICE_ENABLED =
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_BUCKET
export const GCS_SERVICE_ENABLED =
  process.env.GCS_KEY_FILENAME &&
  process.env.GCS_BUCKET &&
  process.env.GCS_PROJECT_ID

const drives = {
  /**
   * Persist files on the local filesystem
   */
  fs: new FSDriver({
    location: './storage',
    visibility: 'public',
  }),

  /**
   * Persist files on AWS S3 or alike service
   */
  ...(S3_SERVICE_ENABLED && {
    s3: new S3Driver({
      client: s3Client,
      bucket: process.env.AWS_BUCKET!,
      visibility: 'private',
    }),
  }),

  /**
   * Persist files on GCS service
   */
  ...(GCS_SERVICE_ENABLED && {
    gcs: new GCSDriver({
      bucket: process.env.GCS_BUCKET!,
      visibility: 'private',
      usingUniformAcl: true,
      keyFilename: process.env.GCS_KEY_FILENAME,
      projectId: process.env.GCS_PROJECT_ID,
    }),
  }),
} as const

export const disk = new Disk(drives[process.env.DRIVE_DISK || 'fs']!)
