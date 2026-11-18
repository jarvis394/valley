import { ImmichStorage } from './immich'
import { LocalStorage } from './local'
import { R2Storage } from './r2'
import { S3Storage } from './s3'
import { StorageError, type Storage, type StorageDriverName } from './types'

type Env = Record<string, string | undefined>

const DRIVERS: StorageDriverName[] = ['s3', 'r2', 'local', 'immich']

function required(env: Env, name: string) {
  const value = env[name]
  if (!value) throw new StorageError(`${name} is not set`, 'not-configured')

  return value
}

/**
 * Builds the driver `STORAGE_DRIVER` names (default `s3`) from the matching `S3_*`, `R2_*`,
 * `LOCAL_STORAGE_*` or `IMMICH_*` variables. `.env.example` at the repo root lists them.
 */
export function createStorageFromEnv(env: Env = process.env): Storage {
  const driver = (env.STORAGE_DRIVER ?? 's3') as StorageDriverName
  const publicUrl = env.STORAGE_PUBLIC_URL || undefined
  const keyPrefix = env.STORAGE_KEY_PREFIX ?? ''

  switch (driver) {
    case 's3':
      return new S3Storage({
        bucket: required(env, 'S3_BUCKET'),
        region: env.S3_REGION,
        endpoint: env.S3_ENDPOINT || undefined,
        accessKeyId: required(env, 'S3_ACCESS_KEY_ID'),
        secretAccessKey: required(env, 'S3_SECRET_ACCESS_KEY'),
        forcePathStyle: env.S3_FORCE_PATH_STYLE === 'true',
        publicUrl,
        keyPrefix,
      })
    case 'r2':
      return new R2Storage({
        accountId: required(env, 'R2_ACCOUNT_ID'),
        bucket: required(env, 'R2_BUCKET'),
        accessKeyId: required(env, 'R2_ACCESS_KEY_ID'),
        secretAccessKey: required(env, 'R2_SECRET_ACCESS_KEY'),
        jurisdiction: env.R2_JURISDICTION as 'eu' | 'fedramp' | undefined,
        publicUrl,
        keyPrefix,
      })
    case 'local':
      return new LocalStorage({ root: required(env, 'LOCAL_STORAGE_ROOT'), publicUrl, keyPrefix })
    case 'immich':
      return new ImmichStorage({
        root: required(env, 'IMMICH_ROOT'),
        folder: env.IMMICH_FOLDER,
        publicUrl,
      })
    default:
      throw new StorageError(
        `Unknown STORAGE_DRIVER ${JSON.stringify(driver)}; use one of ${DRIVERS.join(', ')}`,
        'not-configured',
      )
  }
}
