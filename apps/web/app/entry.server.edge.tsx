import { RemixServer } from '@remix-run/react'
import { isbot } from 'isbot'
import { renderToReadableStream } from 'react-dom/server'
import { NonceProvider } from './components/NonceProvider/NonceProvider'
import { init as envInit } from './server/env.server'
import { makeTimings } from './server/timing.server'
import type {
  EntryContext,
  HandleDocumentRequestFunction,
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

export default handleRequest
