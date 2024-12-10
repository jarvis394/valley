import { RemixServer } from '@remix-run/react'
import { isbot } from 'isbot'
import { renderToReadableStream } from 'react-dom/server'
import { NonceProvider } from './components/NonceProvider/NonceProvider'
import { init as envInit } from './server/env.server'
import { makeTimings } from './server/timing.server'
import ansis from 'ansis'
import * as Sentry from '@sentry/remix'
import type {
  EntryContext,
  HandleDocumentRequestFunction,
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from '@remix-run/cloudflare'

const ABORT_DELAY = 5_000

envInit()

const handleRequest: HandleDocumentRequestFunction = async (
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext
) => {
  // NOTE: this timing will only include things that are rendered in the shell
  // and will not include suspended components and deferred loaders
  const timings = makeTimings('render', 'renderToReadableStream')
  const nonce = loadContext.cspNonce?.toString()
  const readable = await renderToReadableStream(
    <NonceProvider value={nonce || ''}>
      <RemixServer
        nonce={nonce}
        context={remixContext}
        abortDelay={ABORT_DELAY}
        url={request.url}
      />
    </NonceProvider>,
    {
      signal: request.signal,
      nonce,
      onError(error: unknown) {
        console.error(error)
        responseStatusCode = 500
      },
    }
  )

  if (isbot(request.headers.get('user-agent') || '')) {
    await readable.allReady
  }

  responseHeaders.set('Content-Type', 'text/html')
  responseHeaders.append('Server-Timing', timings.toString())

  return new Response(readable, {
    headers: responseHeaders,
    status: responseStatusCode,
  })
}

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

export default handleRequest
