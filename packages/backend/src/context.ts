import { createDb, type Db } from '@valley/db'
import { createStorageFromEnv, type Storage } from '@valley/storage'
import { createAuth, type Auth } from './auth'
import { readAuthEnv, readEnv } from './env'
import { createMailer, type Mailer } from './mail'

interface Services {
  db?: Db
  storage?: Storage
  mailer?: Mailer
  auth?: Auth
}

// Kept on globalThis so dev-server module reloads reuse one connection pool and auth instance.
const services: Services = ((globalThis as { valleyServices?: Services }).valleyServices ??= {})

export const getDb = () => (services.db ??= createDb(readEnv().DATABASE_URL))

export const getStorage = () => (services.storage ??= createStorageFromEnv())

export function getMailer() {
  if (services.mailer) return services.mailer

  const env = readAuthEnv()

  return (services.mailer = createMailer({ apiKey: env.RESEND_API_KEY, from: env.MAIL_FROM }))
}

export function getAuth() {
  if (services.auth) return services.auth

  return (services.auth = createAuth({
    db: getDb(),
    storage: getStorage(),
    mailer: getMailer(),
    env: readAuthEnv(),
  }))
}

export const getSignupMode = () => readAuthEnv().VALLEY_SIGNUP_MODE
