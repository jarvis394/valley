import { createRequestHandler } from '@remix-run/node'

declare global {
  interface CloudflareEnvironment {}
}

const requestHandler = createRequestHandler(
  // @ts-expect-error - virtual module provided by React Router at build time
  () => import('virtual:react-router/server-build'),
  import.meta.env.MODE
)

export default {
  fetch(request: Request) {
    return requestHandler(request)
  },
}
