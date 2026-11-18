import { createFileRoute } from '@tanstack/react-router'
import { getUploadServer } from '../../../server/backend.server'

/** tus resumable-upload endpoint. Creation lands here, chunks on `/api/uploads/<id>`. */
export const Route = createFileRoute('/api/uploads/')({
  server: {
    handlers: {
      ANY: ({ request }) => getUploadServer().handleWeb(request),
    },
  },
})
