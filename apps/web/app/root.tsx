import React from 'react'
import {
  Links,
  Meta,
  data,
  Outlet,
  Scripts,
  ScrollRestoration,
  ShouldRevalidateFunction,
  useLoaderData,
} from 'react-router'
import styles from './root.module.css'
import { GeneralErrorBoundary } from './components/ErrorBoundary'
import { useNonce } from './components/NonceProvider/NonceProvider'
import { getTheme } from './utils/theme'
import { useOptionalTheme } from './routes/resources+/theme-switch'
import { getEnv } from './server/env.server'
import { ClientHintCheck, getHints } from './components/ClientHints/ClientHints'
import { combineHeaders, getDomainUrl } from './utils/misc'
import { makeTimings } from './server/timing.server'
import { HoneypotProvider } from './components/Honeypot/Honeypot'
import { honeypot } from './server/honeypot.server'
import Toaster, { useToast } from '@valley/ui/Toast'
import { getToast } from './server/toast.server'
import { Modals } from './components/Modals'
import UploadsOverlay from './components/UploadsOverlay/UploadsOverlay'
import { pipeHeaders } from './server/headers.server'
import { Route } from './+types/root'
import { SortableProvider } from 'use-sortablejs'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import calendar from 'dayjs/plugin/calendar'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { Theme } from '@valley/shared'

import './styles/global.css'

dayjs.extend(calendar)
dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)

const mountMultiDragPlugin = async () => {
  if (typeof window === 'undefined') {
    return
  }
  try {
    const pkg = await import(
      // @ts-expect-error - @types/sortablejs doesn't have correct types
      'sortablejs/modular/sortable.esm.js'
    )
    pkg.default.mount(new pkg.MultiDrag())
  } catch (e) {
    console.warn('Could not load MultiDrag sortablejs plugin:')
    console.warn(e)
  }
}
mountMultiDragPlugin()

export const links: Route.LinksFunction = () => [
  {
    rel: 'preload',
    href: '/fonts/webfonts/Geist[wght].woff2',
    as: 'font',
    crossOrigin: 'anonymous',
    type: 'font/woff2',
  },
  {
    rel: 'preload',
    href: '/fonts/variable/Geist[wght].ttf',
    as: 'font',
    crossOrigin: 'anonymous',
    type: 'font/ttf',
  },
  {
    rel: 'manifest',
    href: '/site.webmanifest',
    crossOrigin: 'use-credentials',
  },
]

export async function loader({ request }: Route.LoaderArgs) {
  const timings = makeTimings('root loader')
  const honeypotPropsPromise = honeypot.getInputProps()
  const toastPromise = getToast(request)
  const [honeypotProps, { toast, headers: toastHeaders }] = await Promise.all([
    honeypotPropsPromise,
    toastPromise,
  ])

  return data(
    {
      requestInfo: {
        hints: getHints(request),
        origin: getDomainUrl(request),
        path: new URL(request.url).pathname,
        userSettings: {
          theme: getTheme(request),
        },
      },
      toast,
      honeypotProps,
      ENV: getEnv(),
    },
    {
      headers: combineHeaders(
        { 'Server-Timing': timings.toString() },
        toastHeaders
      ),
    }
  )
}

export const headers: Route.HeadersFunction = pipeHeaders

export const shouldRevalidate: ShouldRevalidateFunction = ({ formAction }) => {
  // Revalidate if formAction is present (it can return a toast)
  if (formAction) {
    return true
  }

  return false
}

export const meta: Route.MetaFunction = () => {
  return [
    {
      name: 'theme-color',
      media: '(prefers-color-scheme: light)',
      content: '#ffffff',
    },
    {
      name: 'theme-color',
      media: '(prefers-color-scheme: dark)',
      content: '#0e0e0e',
    },
  ]
}

export function Document({
  children,
  nonce,
  theme = Theme.SYSTEM,
  env = {},
}: {
  children: React.ReactNode
  nonce: string
  theme?: Theme
  env?: Record<string, string>
}) {
  return (
    <html data-theme={theme} lang="en">
      <head>
        <title>Valley</title>
        <meta charSet="utf-8" />
        <ClientHintCheck nonce={nonce} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <meta name="color-scheme" content="light dark" />
        <link
          rel="icon"
          href="/favicon.ico"
          type="image/x-icon"
          sizes="48x48"
        />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#0a0a0a" />
        <link
          rel="icon"
          href="/favicon-16x16.png"
          type="image/png"
          sizes="16x16"
        />
        <link
          rel="icon"
          href="/favicon-32x32.png"
          type="image/png"
          sizes="32x32"
        />
        <link
          rel="apple-touch-icon"
          href="/apple-touch-icon.png"
          sizes="180x180"
        />
        <Meta />
        <Links />
      </head>
      <body className={styles.root}>
        {children}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(env)}`,
          }}
        />
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  )
}

export function Layout({ children }: { children: React.ReactNode }) {
  // if there was an error running the loader, data could be missing
  const data = useLoaderData<typeof loader | null>()
  const nonce = useNonce()
  const theme = useOptionalTheme()

  return (
    <Document nonce={nonce} theme={theme} env={data?.ENV}>
      {children}
    </Document>
  )
}

const App: React.FC<Route.ComponentProps> = ({ loaderData }) => {
  const theme = useOptionalTheme()

  useToast(loaderData?.toast)

  return (
    <SortableProvider>
      <HoneypotProvider {...loaderData?.honeypotProps}>
        <Outlet />
        <Modals />
        <UploadsOverlay />
        <Toaster theme={theme} />
      </HoneypotProvider>
    </SortableProvider>
  )
}

export const ErrorBoundary = GeneralErrorBoundary
export default React.memo(App)
