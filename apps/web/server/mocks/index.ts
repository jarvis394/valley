import closeWithGrace from 'close-with-grace'
import { setupServer } from 'msw/node'
import { handlers as resendHandlers } from './resend.js'
import { handlers as githubHandlers } from './github.js'

export const server = setupServer(...resendHandlers, ...githubHandlers)

if (process.env.NODE_ENV !== 'test') {
  server.listen({
    onUnhandledRequest(request, print) {
      if (request.url.includes('.sentry.io')) return
      if (request.url.includes('neon.tech')) return
      print.warning()
    },
  })

  console.info('🔶 Mock server installed')

  closeWithGrace(() => {
    server.close()
  })
}
