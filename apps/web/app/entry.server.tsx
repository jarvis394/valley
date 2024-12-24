import { handleRequest } from '@vercel/remix'
import { RemixServer } from '@remix-run/react'
import type { AppLoadContext, EntryContext } from '@vercel/remix'
import { NonceProvider } from './components/NonceProvider/NonceProvider'

export default function (
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: AppLoadContext
) {
  const cspNonce = crypto.randomUUID()
  const nonce = loadContext.cspNonce?.toString() || cspNonce
  const remixServer = (
    <NonceProvider value={nonce || ''}>
      <RemixServer nonce={nonce} context={remixContext} url={request.url} />
    </NonceProvider>
  )
  return handleRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixServer
  )
}
