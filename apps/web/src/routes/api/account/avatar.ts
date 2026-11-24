import { createFileRoute } from '@tanstack/react-router'
import {
  BackendError,
  MAX_AVATAR_BYTES,
  getDb,
  getStorage,
  resolveRef,
  updateProfileAvatar,
} from '@valley/backend'
import { mediaUrl, requireAccount } from '../../../server/backend.server'

const MAX_FORM_OVERHEAD_BYTES = 64 * 1024

async function uploadAvatar({ request }: { request: Request }) {
  try {
    const { accountId } = await requireAccount(request)
    const length = Number(request.headers.get('content-length'))
    if (!length) return Response.json({ error: 'Content-Length is required' }, { status: 411 })
    if (length > MAX_AVATAR_BYTES + MAX_FORM_OVERHEAD_BYTES) {
      return Response.json({ error: 'Avatar image must be 5 MB or smaller' }, { status: 413 })
    }

    const form = await request.formData()
    const file = form.get('file')
    if (!(file instanceof File)) {
      return Response.json({ error: 'Select an image file' }, { status: 400 })
    }

    const bytes = new Uint8Array(await file.arrayBuffer())
    const ref = await updateProfileAvatar(getDb(), getStorage(), accountId, {
      bytes,
      contentType: file.type,
    })

    return Response.json({ avatar: resolveRef(ref, mediaUrl) ?? null })
  } catch (error) {
    if (error instanceof BackendError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    throw error
  }
}

async function removeAvatar({ request }: { request: Request }) {
  try {
    const { accountId } = await requireAccount(request)
    await updateProfileAvatar(getDb(), getStorage(), accountId, null)

    return Response.json({ avatar: null })
  } catch (error) {
    if (error instanceof BackendError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    throw error
  }
}

export const Route = createFileRoute('/api/account/avatar')({
  server: { handlers: { PUT: uploadAvatar, DELETE: removeAvatar } },
})
