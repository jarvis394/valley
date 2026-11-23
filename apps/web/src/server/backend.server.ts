import { getRequestHeaders } from '@tanstack/react-start/server'
import {
  BackendError,
  createUploadServer,
  getAuth,
  getDb,
  getStorage,
  isApproved,
  mediaRoute,
  readEnv,
} from '@valley/backend'
import { MEDIA_BASE, UPLOADS_PATH } from '../config/routes'

export const mediaUrl = mediaRoute(MEDIA_BASE)

export async function getSession(request?: Request) {
  const headers = request ? request.headers : getRequestHeaders()

  return getAuth().api.getSession({ headers })
}

export async function requireSignedIn(request?: Request) {
  const session = await getSession(request)
  if (!session) throw new BackendError('unauthorized', 'Sign in required')

  return session
}

/** Resolves the signed-in, approved user for an app route or upload request. */
export async function requireAccount(request?: Request) {
  const session = await requireSignedIn(request)
  if (!isApproved(session.user)) throw new BackendError('forbidden', 'pending_approval')

  return { accountId: session.user.id, user: session.user }
}

export async function requireAdmin(request?: Request) {
  const session = await requireAccount(request)
  if (session.user.role !== 'admin') throw new BackendError('forbidden', 'Admin access required')

  return session
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
