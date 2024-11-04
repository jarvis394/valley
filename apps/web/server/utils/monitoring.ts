import { nodeProfilingIntegration } from '@sentry/profiling-node'
import Sentry from '@sentry/remix'

const TRACES_SAMPLE_RATE = 1

export function init() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate:
      process.env.NODE_ENV === 'production' ? TRACES_SAMPLE_RATE : 0,
    autoInstrumentRemix: true,
    denyUrls: [
      /\/resources\/healthcheck/,
      /\/build\//,
      /\/favicons\//,
      /\/img\//,
      /\/fonts\//,
      /\/favicon.ico/,
      /\/site\.webmanifest/,
    ],
    integrations: [
      Sentry.httpIntegration(),
      Sentry.prismaIntegration(),
      nodeProfilingIntegration(),
    ],
    tracesSampler(samplingContext) {
      // ignore healthcheck transactions by other services (consul, etc.)
      if (samplingContext.request?.url?.includes('/resources/healthcheck')) {
        return 0
      }
      return 1
    },
    beforeSendTransaction(event) {
      // ignore all healthcheck related transactions
      //  note that name of header here is case-sensitive
      if (event.request?.headers?.['x-healthcheck'] === 'true') {
        return null
      }

      return event
    },
  })
}
