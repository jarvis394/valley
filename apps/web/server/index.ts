import crypto from 'node:crypto'
import { createRequestHandler } from '@remix-run/express'
import { type ServerBuild } from '@vercel/remix'
import Sentry from '@sentry/remix'
import { ip as ipAddress } from 'address'
import ansis from 'ansis'
import closeWithGrace from 'close-with-grace'
import compression from 'compression'
import express, { Response } from 'express'
import rateLimit from 'express-rate-limit'
import getPort, { portNumbers } from 'get-port'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from '@dotenvx/dotenvx'
import path from 'path'

const startingTime = Date.now()

dotenv.config({ path: path.join('../../.env') })

const MODE = process.env.NODE_ENV ?? 'development'
const MOCKS_ENABLED = process.env.MOCKS === 'true'
const IS_PROD = MODE === 'production'
const SENTRY_ENABLED = IS_PROD && process.env.SENTRY_DSN

if (SENTRY_ENABLED) {
  void import('./utils/monitoring.js').then(({ init }) => init())
}

if (MOCKS_ENABLED) {
  await import('./mocks/index.js')
}

const viteDevServer = IS_PROD
  ? null
  : await import('vite').then((vite) =>
      vite.createServer({
        server: { middlewareMode: true },
      })
    )

const app = express()

const getHost = (req: { get: (key: string) => string | undefined }) =>
  req.get('X-Forwarded-Host') ?? req.get('host') ?? ''

// Redirect HTTP requests to HTTPSapp.use((req, res, next) => {
app.use((req, res, next) => {
  if (req.method !== 'GET') return next()

  const proto = req.headers['X-Forwarded-Proto']
  const host = getHost(req)

  if (proto === 'http') {
    res.setHeader('X-Forwarded-Proto', 'https')
    res.redirect(302, `https://${host}${req.originalUrl}`)
    return
  }

  next()
})

// Remove ending slashes for SEO reasons
app.get('*', (req, res, next) => {
  if (req.path.endsWith('/') && req.path.length > 1) {
    const query = req.url.slice(req.path.length)
    const safepath = req.path.slice(0, -1).replace(/\/+/g, '/')
    return res.redirect(302, safepath + query)
  }

  next()
})

app.use(compression())
app.disable('x-powered-by')

if (viteDevServer) {
  app.use(viteDevServer.middlewares)
} else {
  // Remix fingerprints its assets so we can cache forever.
  app.use(
    '/assets',
    express.static('build/client/assets', { immutable: true, maxAge: '1y' })
  )

  // Everything else (like favicon.ico) is cached for an hour
  app.use(express.static('build/client', { maxAge: '1h' }))
}

// TODO: fix types
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
app.get(['/img/*', '/favicons/*'], (_req, res) => {
  // if we made it past the express.static for these, then we're missing something.
  // So we'll just send a 404 and won't bother calling other middleware.
  return res.status(404).send('Not found')
})

morgan.token('url', (req) => decodeURIComponent(req.url ?? ''))
app.use(
  morgan('tiny', {
    skip: (req, res) =>
      res.statusCode === 200 && req.url?.startsWith('/resources/healthcheck'),
  })
)

app.use((_, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString('hex')
  next()
})

app.use(
  helmet({
    xPoweredBy: false,
    referrerPolicy: { policy: 'same-origin' },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        'connect-src': [
          MODE === 'development' ? 'ws:' : null,
          SENTRY_ENABLED ? '*.sentry.io' : null,
          process.env.TUSD_URL || null,
          process.env.UPLOAD_SERVICE_URL || null,
          "'self'",
        ].filter((e) => e !== null),
        'font-src': ["'self'"],
        'frame-src': ["'self'"],
        'img-src': [
          "'self'",
          'data:',
          'https://avatars.githubusercontent.com',
          process.env.UPLOAD_SERVICE_URL || null,
        ].filter((e) => e !== null),
        'script-src': [
          "'strict-dynamic'",
          "'self'",
          (_, res) => `'nonce-${(res as Response).locals.cspNonce}'`,
        ],
        'script-src-attr': [
          (_, res) => `'nonce-${(res as Response).locals.cspNonce}'`,
        ],
        'upgrade-insecure-requests': null,
      },
    },
  })
)

const maxMultiple = IS_PROD ? 1 : 10_000
const rateLimitDefault = {
  windowMs: 60 * 1000,
  max: 1000 * maxMultiple,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  keyGenerator: (req: express.Request) => {
    return (
      req.get('fly-client-ip') ?? req.get('cf-connecting-ip') ?? `${req.ip}`
    )
  },
}

const strongestRateLimit = rateLimit({
  ...rateLimitDefault,
  windowMs: 60 * 1000,
  max: 10 * maxMultiple,
})

const strongRateLimit = rateLimit({
  ...rateLimitDefault,
  windowMs: 60 * 1000,
  max: 100 * maxMultiple,
})

const generalRateLimit = rateLimit(rateLimitDefault)
app.use((req, res, next) => {
  const strongPaths = [
    '/auth',
    '/admin',
    '/reset-password',
    '/settings/profile',
    '/resources/login',
    '/resources/verify',
  ]

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    if (strongPaths.some((p) => req.path.startsWith(p))) {
      return strongestRateLimit(req, res, next)
    }

    return strongRateLimit(req, res, next)
  }

  // the verify route is a special case because it's a GET route that
  // can have a token in the query string
  if (req.path.includes('/verify')) {
    return strongestRateLimit(req, res, next)
  }

  return generalRateLimit(req, res, next)
})

async function getBuild() {
  try {
    const build = viteDevServer
      ? await viteDevServer.ssrLoadModule('virtual:remix/server-build')
      : await import('../server/index.js')

    return { build: build as unknown as ServerBuild, error: null }
  } catch (error) {
    // Catch error and return null to make express happy and avoid an unrecoverable crash
    console.error('Error creating build:', error)
    return { error: error, build: null as unknown as ServerBuild }
  }
}

app.all(
  '*',
  createRequestHandler({
    getLoadContext: (_: unknown, res: Response) => ({
      cspNonce: res.locals.cspNonce,
      serverBuild: getBuild(),
    }),
    mode: MODE,
    build: async () => {
      const { error, build } = await getBuild()
      if (error) {
        throw error
      }

      return build
    },
  })
)

const desiredPort = Number(process.env.WEB_PORT) || 4200
const portToUse = await getPort({
  port: portNumbers(desiredPort, desiredPort + 100),
})
const portAvailable = desiredPort === portToUse

// Exiting in production if port is not available
if (!portAvailable && IS_PROD) {
  console.log(`⚠️ Port ${desiredPort} is not available, exiting.`)
  process.exit(1)
}

const server = app.listen(portToUse, () => {
  if (!portAvailable) {
    console.warn(
      ansis.yellow(
        `⚠️  Port ${desiredPort} is not available, using ${portToUse} instead.`
      )
    )
  }

  const localUrl = `http://localhost:${portToUse}`
  let lanUrl: string | null = null
  const localIp = ipAddress() ?? 'Unknown'
  // Check if the address is a private ip
  // https://en.wikipedia.org/wiki/Private_network#Private_IPv4_address_spaces
  // https://github.com/facebook/create-react-app/blob/d960b9e38c062584ff6cfb1a70e1512509a966e7/packages/react-dev-utils/WebpackDevServerUtils.js#LL48C9-L54C10
  if (/^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(localIp)) {
    lanUrl = `http://${localIp}:${portToUse}`
  }

  const elapsedTimeMs = Date.now() - startingTime

  console.log()
  console.log(
    `  ${ansis.bgBlack.bold.white(' Valley ')}  ${ansis.gray(
      'ready in'
    )} ${ansis.bold.white(elapsedTimeMs.toString())} ${ansis.white('ms')}`
  )
  console.log()
  console.log(
    `  ${ansis.bold.green('➜')}  ${ansis.bold('Local:')}   ${ansis.cyan(
      localUrl
    )}`
  )
  lanUrl &&
    console.log(
      `  ${ansis.bold.green('➜')}  ${ansis.bold('Network:')} ${ansis.cyan(
        lanUrl
      )}`
    )
  console.log()
})

closeWithGrace(async ({ err }) => {
  await new Promise<void>((resolve, reject) => {
    server.close((e) => (e ? reject(e) : resolve()))
  })

  if (err) {
    console.error(ansis.red(err.stack || err.message))

    SENTRY_ENABLED && Sentry.captureException(err)
    SENTRY_ENABLED && (await Sentry.flush(500))
  }
})
