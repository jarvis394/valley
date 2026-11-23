import { createFileRoute } from '@tanstack/react-router'
import { getAuth } from '@valley/backend'

const handle = ({ request }: { request: Request }) => getAuth().handler(request)

export const Route = createFileRoute('/api/auth/$')({
  server: { handlers: { GET: handle, POST: handle } },
})
