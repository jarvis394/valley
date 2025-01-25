import { Env } from '@adonisjs/core/env'

/**
 * Locate .env file from monorepo root
 */
let APP_ROOT = new URL('../../../', import.meta.url)

if (import.meta.url.includes('build')) {
  APP_ROOT = new URL('../../../../', import.meta.url)
}

export default await Env.create(APP_ROOT, {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  APP_KEY: Env.schema.string(),
  PORT: Env.schema.number(),
  WEB_PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  WEB_SERVICE_URL: Env.schema.string(),
  UPLOAD_SERVICE_URL: Env.schema.string(),
  SESSION_SECRET: Env.schema.string(),
  LOG_LEVEL: Env.schema.enum([
    'fatal',
    'error',
    'warn',
    'info',
    'debug',
    'trace',
  ]),

  /*
  |----------------------------------------------------------
  | Variables for configuring database connection
  |----------------------------------------------------------
  */
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string(),
  DB_DATABASE: Env.schema.string(),
  DATABASE_URL: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the drive package
  |----------------------------------------------------------
  */
  DRIVE_DISK: Env.schema.enum(['fs', 's3', 'gcs'] as const),
  AWS_ACCESS_KEY_ID: Env.schema.string.optional(),
  AWS_SECRET_ACCESS_KEY: Env.schema.string.optional(),
  AWS_REGION: Env.schema.string.optional(),
  AWS_ENDPOINT: Env.schema.string.optional(),
  UPLOAD_BUCKET: Env.schema.string.optional(),
  GCS_KEY_FILENAME: Env.schema.string.optional(),
  GCS_BUCKET: Env.schema.string.optional(),
  GCS_PROJECT_ID: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the lock package
  |----------------------------------------------------------
  */
  LOCK_STORE: Env.schema.enum(['redis', 'memory'] as const),
  REDIS_HOST: Env.schema.string({ format: 'host' }),
  REDIS_PORT: Env.schema.number(),
  REDIS_PASSWORD: Env.schema.string.optional(),
})
