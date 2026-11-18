import { createFileRoute } from '@tanstack/react-router'
import { getUploadServer } from '../../../server/backend.server'

export const Route = createFileRoute('/api/uploads/$')({
  server: {
    handlers: {
      ANY: ({ request }) => getUploadServer().handleWeb(request),
    },
  },
})
