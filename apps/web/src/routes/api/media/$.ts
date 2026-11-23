import { createFileRoute } from '@tanstack/react-router'
import {
  BackendError,
  StorageError,
  canAccessMediaKey,
  getDb,
  getStorage,
  serveMedia,
} from '@valley/backend'
import { requireAccount } from '../../../server/backend.server'

/** Streams a stored file to the editor after checking account access. */
async function serve({ request, params }: { request: Request; params: { _splat?: string } }) {
  try {
    const { user } = await requireAccount(request)
    const key = params._splat ?? ''
    const storage = getStorage()
    const allowed = await canAccessMediaKey(
      getDb(),
      storage,
      { id: user.id, role: user.role ?? 'user' },
      key,
    )
    if (!allowed) return new Response('Not found', { status: 404 })

    return await serveMedia(request, storage, key)
  } catch (error) {
    if (error instanceof BackendError) {
      return new Response(error.message, { status: error.status })
    }
    if (error instanceof StorageError && error.code === 'invalid-key') {
      return new Response('Bad request', { status: 400 })
    }
    throw error
  }
}

export const Route = createFileRoute('/api/media/$')({
  server: { handlers: { GET: serve, HEAD: serve } },
})
