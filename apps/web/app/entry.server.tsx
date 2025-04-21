import crypto from 'node:crypto'
import { PassThrough } from 'node:stream'
import { styleText } from 'node:util'
import { contentSecurity } from '@nichtsam/helmet/content'
import { createReadableStreamFromReadable } from '@react-router/node'
import { isbot } from 'isbot'
import { renderToPipeableStream } from 'react-dom/server'
import {
  ServerRouter,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type HandleDocumentRequestFunction,
} from 'react-router'
import { init } from './server/env.server'
import { NonceProvider } from './components/NonceProvider/NonceProvider'
import { makeTimings } from './server/timing.server'

export const streamTimeout = 5000

init()

const MODE = process.env.NODE_ENV ?? 'development'

type DocRequestArgs = Parameters<HandleDocumentRequestFunction>

export default async function handleRequest(...args: DocRequestArgs) {
  const [request, responseStatusCode, responseHeaders, reactRouterContext] =
    args

  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    responseHeaders.append('Document-Policy', 'js-profiling')
  }

  const callbackName = isbot(request.headers.get('user-agent'))
    ? 'onAllReady'
    : 'onShellReady'

  const nonce = crypto.randomBytes(16).toString('hex')
  return new Promise(async (resolve, reject) => {
    let didError = false
    // NOTE: this timing will only include things that are rendered in the shell
    // and will not include suspended components and deferred loaders
    const timings = makeTimings('render', 'renderToPipeableStream')

    const { pipe, abort } = renderToPipeableStream(
      <NonceProvider value={nonce}>
        <ServerRouter
          nonce={nonce}
          context={reactRouterContext}
          url={request.url}
        />
      </NonceProvider>,
      {
        [callbackName]: () => {
          const body = new PassThrough()
          responseHeaders.set('Content-Type', 'text/html')
          responseHeaders.append('Server-Timing', timings.toString())

          contentSecurity(responseHeaders, {
            crossOriginEmbedderPolicy: false,
            contentSecurityPolicy: {
              directives: {
                fetch: {
                  'connect-src': [
                    MODE === 'development' ? 'ws:' : undefined,
                    "'self'",
                  ],
                  'font-src': ["'self'"],
                  'frame-src': ["'self'"],
                  'img-src': [
                    "'self'",
                    'data:',
                    'https://avatars.githubusercontent.com',
                    '*.userapi.com',
                  ],
                  'script-src': [
                    "'strict-dynamic'",
                    "'self'",
                    `'nonce-${nonce}'`,
                  ],
                  'script-src-attr': [`'nonce-${nonce}'`],
                },
              },
            },
          })

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

    setTimeout(abort, streamTimeout + 5000)
  })
}

export async function handleDataRequest(response: Response) {
  return response
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
    console.error(styleText('red', String(error.stack)))
  } else {
    console.error(error)
  }
}
