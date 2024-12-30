import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig, services } from '@adonisjs/drive'
import { S3Client } from '@aws-sdk/client-s3'

const AWS_ACCESS_KEY_ID = env.get('AWS_ACCESS_KEY_ID')
const AWS_SECRET_ACCESS_KEY = env.get('AWS_SECRET_ACCESS_KEY')
const UPLOAD_BUCKET = env.get('UPLOAD_BUCKET')

export const s3Client = new S3Client({
  endpoint: env.get('AWS_ENDPOINT'),
  region: env.get('AWS_REGION'),
  forcePathStyle: true,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID || '',
    secretAccessKey: AWS_SECRET_ACCESS_KEY || '',
  },
})

const GCS_KEY = env.get('GCS_KEY')
const GCS_BUCKET = env.get('GCS_BUCKET')

const S3_SERVICE_ENABLED =
  !!AWS_ACCESS_KEY_ID && !!AWS_SECRET_ACCESS_KEY && !!UPLOAD_BUCKET
const GCS_SERVICE_ENABLED = !!GCS_KEY && !!GCS_BUCKET

const driveConfig = defineConfig({
  default: env.get('DRIVE_DISK'),

  services: {
    /**
     * Persist files on the local filesystem
     */
    fs: services.fs({
      location: app.makePath('storage'),
      serveFiles: false,
      routeBasePath: '/uploads',
      visibility: 'public',
    }),

    /**
     * Persist files on AWS S3 or alike service
     */
    ...(S3_SERVICE_ENABLED && {
      s3: services.s3({
        client: s3Client,
        bucket: UPLOAD_BUCKET,
        visibility: 'private',
      }),
    }),

    /**
     * Persist files on GCS service
     */
    ...(GCS_SERVICE_ENABLED && {
      gcs: services.gcs({
        bucket: GCS_BUCKET,
        visibility: 'private',
        usingUniformAcl: true,
        keyFilename: GCS_KEY,
      }),
    }),
  },
})

export default driveConfig

declare module '@adonisjs/drive/types' {
  export interface DriveDisks extends InferDriveDisks<typeof driveConfig> {}
}
