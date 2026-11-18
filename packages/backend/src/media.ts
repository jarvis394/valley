import { contentTypeFor, type ByteRange, type Storage } from '@valley/storage'

/**
 * Parses a single-range `Range` header against an object of `size` bytes. Returns `null`
 * for no or unsupported ranges and `'invalid'` for ranges outside the object.
 */
export function parseRange(header: string | null, size: number): ByteRange | null | 'invalid' {
  const match = header && /^bytes=(\d*)-(\d*)$/.exec(header.trim())
  if (!match) return null
  const [, from = '', to = ''] = match
  if (!from && !to) return null

  const range = from
    ? { start: Number(from), end: to ? Math.min(Number(to), size - 1) : size - 1 }
    : { start: Math.max(size - Number(to), 0), end: size - 1 }

  return range.start > range.end || range.start >= size ? 'invalid' : range
}

export interface ServeMediaOptions {
  /** `Cache-Control` for found objects. Keys never change content, so they cache for long. */
  cacheControl?: string
}

/** Streams a stored object, honoring `Range`, `HEAD` and `If-None-Match`. */
export async function serveMedia(
  request: Request,
  storage: Storage,
  key: string,
  { cacheControl = 'private, max-age=31536000, immutable' }: ServeMediaOptions = {},
) {
  const head = await storage.head(key)
  if (!head) return new Response('Not found', { status: 404 })

  const headers = new Headers({
    'Accept-Ranges': 'bytes',
    'Cache-Control': cacheControl,
    'Content-Type': head.contentType ?? contentTypeFor(key),
  })
  if (head.etag) headers.set('ETag', head.etag)
  if (head.lastModified) headers.set('Last-Modified', head.lastModified.toUTCString())

  if (head.etag && request.headers.get('If-None-Match') === head.etag) {
    return new Response(null, { status: 304, headers })
  }

  const range = parseRange(request.headers.get('Range'), head.size)
  if (range === 'invalid') {
    headers.set('Content-Range', `bytes */${head.size}`)

    return new Response(null, { status: 416, headers })
  }

  const length = range ? range.end - range.start + 1 : head.size
  headers.set('Content-Length', String(length))
  if (range) headers.set('Content-Range', `bytes ${range.start}-${range.end}/${head.size}`)
  const status = range ? 206 : 200
  if (request.method === 'HEAD') return new Response(null, { status, headers })

  const object = await storage.read(key, range ?? undefined)
  if (!object) return new Response('Not found', { status: 404 })

  return new Response(object.body, { status, headers })
}
