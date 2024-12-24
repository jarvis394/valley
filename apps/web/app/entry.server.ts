import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from '@remix-run/cloudflare'
import * as Sentry from '@sentry/remix'
import ansis from 'ansis'

declare global {
  export const EdgeRuntime: string | undefined
}

const runtime =
  typeof WebSocketPair !== 'undefined' || typeof EdgeRuntime === 'string'
    ? 'edge'
    : 'node'

let handleRequest: unknown

if (process.env.VERCEL) {
  handleRequest = (await import('./entry.server.vercel')).default
} else if (runtime === 'edge') {
  handleRequest = (await import('./entry.server.edge')).default
} else {
  // handleRequest = (await import('./entry.server.node')).default
}

export default handleRequest

export function handleError(
  error: unknown,
  { request }: LoaderFunctionArgs | ActionFunctionArgs
): void {
  // Skip capturing if the request is aborted as Remix docs suggest
  // Ref: https://remix.run/docs/en/main/file-conventions/entry.server#handleerror
  if (request.signal.aborted) {
    return
  }

  if (error instanceof Error) {
    console.error(ansis.red(error.stack || error.message))
    void Sentry.captureRemixServerException(
      error,
      'remix.server',
      request,
      true
    )
  } else {
    console.error(error)
    Sentry.captureException(error)
  }
}
