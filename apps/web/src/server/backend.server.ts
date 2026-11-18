import {
  createUploadServer,
  getDb,
  getOwner,
  getStorage,
  mediaRoute,
  readEnv,
} from '@valley/backend'
import { MEDIA_BASE, UPLOADS_PATH } from '../config/routes'

export const mediaUrl = mediaRoute(MEDIA_BASE)

/**
 * The account a request acts as. Valley has no sign-in yet, so every request is the owner;
 * this is the one place sign-in plugs into.
 */
export async function requireAccount(_request?: Request) {
  const owner = await getOwner(getDb())

  return { accountId: owner.id, owner }
}

let uploadServer: ReturnType<typeof createUploadServer> | undefined

export const getUploadServer = () =>
  (uploadServer ??= createUploadServer({
    db: getDb(),
    storage: getStorage(),
    path: UPLOADS_PATH,
    maxSize: readEnv().MAX_UPLOAD_BYTES,
    authorize: requireAccount,
    urlFor: mediaUrl,
  }))
