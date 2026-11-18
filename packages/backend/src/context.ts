import { createDb, type Db } from '@valley/db'
import { createStorageFromEnv, type Storage } from '@valley/storage'
import { readEnv } from './env'

interface Services {
  db?: Db
  storage?: Storage
}

// Kept on globalThis so dev-server module reloads reuse one connection pool.
const services: Services = ((globalThis as { valleyServices?: Services }).valleyServices ??= {})

export const getDb = () => (services.db ??= createDb(readEnv().DATABASE_URL))

export const getStorage = () => (services.storage ??= createStorageFromEnv())
