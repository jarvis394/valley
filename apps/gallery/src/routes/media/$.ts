import { createFileRoute } from '@tanstack/react-router'
import { getDb, getStorage, isPublishedKey, serveMedia } from '@valley/backend'

/** Streams files that belong to a published gallery; everything else is a 404. */
async function serve(request: Request, key: string) {
  if (!(await isPublishedKey(getDb(), key))) return new Response('Not found', { status: 404 })

  return serveMedia(request, getStorage(), key, {
    cacheControl: 'public, max-age=31536000, immutable',
  })
}

export const Route = createFileRoute('/media/$')({
  server: {
    handlers: {
      GET: ({ request, params }) => serve(request, params._splat ?? ''),
      HEAD: ({ request, params }) => serve(request, params._splat ?? ''),
    },
  },
})
