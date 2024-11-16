import { PassThrough } from 'node:stream'
import type {
  ActionFunctionArgs,
  EntryContext,
  HandleDocumentRequestFunction,
  LoaderFunctionArgs,
} from '@remix-run/node'
import { createReadableStreamFromReadable } from '@remix-run/node'
import { RemixServer } from '@remix-run/react'
import { isbot } from 'isbot'
import { renderToPipeableStream } from 'react-dom/server'
import { NonceProvider } from './components/NonceProvider/NonceProvider'
import { init as envInit } from './server/env.server'
import { makeTimings } from './server/timing.server'
import chalk from 'chalk'
import * as Sentry from '@sentry/remix'

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
  const nonce = loadContext.cspNonce?.toString() ?? ''
  const callbackName = isbot(request.headers.get('user-agent'))
    ? 'onAllReady'
    : 'onShellReady'

  return new Promise(async (resolve, reject) => {
    let didError = false
    // NOTE: this timing will only include things that are rendered in the shell
    // and will not include suspended components and deferred loaders
    const timings = makeTimings('render', 'renderToPipeableStream')

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
    console.error(chalk.red(error.stack))
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
