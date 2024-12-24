import { PassThrough } from 'node:stream'
import type {
  EntryContext,
  HandleDocumentRequestFunction,
} from '@remix-run/node'
import { createReadableStreamFromReadable } from '@remix-run/node'
import { RemixServer } from '@remix-run/react'
import { isbot } from 'isbot'
import { renderToPipeableStream } from 'react-dom/server'
import { NonceProvider } from './components/NonceProvider/NonceProvider'
import { init as envInit } from './server/env.server'
import { makeTimings } from './server/timing.server'

const ABORT_DELAY = 5_000
export const STREAMING_TIMEOUT = 5_000

envInit()

const handleRequest: HandleDocumentRequestFunction = (
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext
) => {
  const cspNonce = crypto.randomUUID()
  const nonce = loadContext.cspNonce?.toString() ?? cspNonce
  const callbackName = isbot(request.headers.get('user-agent'))
    ? 'onAllReady'
    : 'onShellReady'

  return new Promise(async (resolve, reject) => {
    let didError = false
    // NOTE: this timing will only include things that are rendered in the shell
    // and will not include suspended components and deferred loaders
    const timings = makeTimings('render')

    const { pipe, abort } = renderToPipeableStream(
      <NonceProvider value={nonce}>
        <RemixServer nonce={nonce} context={remixContext} url={request.url} />
      </NonceProvider>,
      {
        [callbackName]: () => {
          const body = new PassThrough()
          responseHeaders.set('Content-Type', 'text/html')
          responseHeaders.append('Server-Timing', timings.toString())
          resolve(
            new Response(createReadableStreamFromReadable(body), {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode,
            })
          )
          pipe(body)
        },
        onShellError: (err: unknown) => {
          reject(err)
        },
        onError: () => {
          didError = true
        },
        nonce,
      }
    )

    setTimeout(abort, STREAMING_TIMEOUT + ABORT_DELAY)
  })
}

export default handleRequest
