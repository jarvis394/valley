import { createFileRoute } from '@tanstack/react-router'
import { getStorage, serveMedia } from '@valley/backend'
import { requireAccount } from '../../../server/backend.server'

/** Streams any stored file to the editor. */
async function serve({ request, params }: { request: Request; params: { _splat?: string } }) {
  await requireAccount(request)

  return serveMedia(request, getStorage(), params._splat ?? '')
}

export const Route = createFileRoute('/api/media/$')({
  server: { handlers: { GET: serve, HEAD: serve } },
})
