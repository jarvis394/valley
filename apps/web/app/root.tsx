import React from 'react'
import {
  Links,
  Meta,
  MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
  ShouldRevalidateFunction,
  useLoaderData,
} from '@remix-run/react'
import cx from 'classnames'
import styles from './root.module.css'
import {
  type HeadersFunction,
  type LinksFunction,
  type LoaderFunctionArgs,
  data,
} from '@remix-run/cloudflare'
import { ManifestLink } from '@remix-pwa/sw'
import { GeneralErrorBoundary } from './components/ErrorBoundary'
import { useNonce } from './components/NonceProvider/NonceProvider'
import { getTheme, Theme } from './utils/theme'
import { useOptionalTheme, useTheme } from './routes/resources+/theme-switch'
import { getEnv } from './server/env.server'
import { ClientHintCheck, getHints } from './components/ClientHints/ClientHints'
import { combineHeaders, getDomainUrl } from './utils/misc'
import { makeTimings, time } from './server/timing.server'
import { HoneypotProvider } from './components/Honeypot/Honeypot'
import { honeypot } from './server/honeypot.server'
import Toaster, { useToast } from './components/Toast/Toast'
import { getToast } from './server/toast.server'
import { Modals } from './components/Modals'
import UploadsOverlay from './components/UploadsOverlay/UploadsOverlay'

import './styles/fonts.css'
import './styles/global.css'
import '@valley/ui/styles/theme.css'
import '@valley/ui/styles/reset.css'
import '@valley/ui/styles/global.css'
import '@uppy/core/dist/style.min.css'
import '@uppy/progress-bar/dist/style.min.css'
import 'overlayscrollbars/overlayscrollbars.css'

export const links: LinksFunction = () => [
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
]

export async function loader({ request }: LoaderFunctionArgs) {
  const timings = makeTimings('root loader')
  const honeypotProps = honeypot.getInputProps()
  const { toast, headers: toastHeaders } = await time(() => getToast(request), {
    type: 'getToast',
  })

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

export const headers: HeadersFunction = ({
  loaderHeaders,
  actionHeaders,
  parentHeaders,
}) => {
  return {
    ...Object.fromEntries(loaderHeaders.entries()),
    ...Object.fromEntries(actionHeaders.entries()),
    ...Object.fromEntries(parentHeaders.entries()),
  }
}

export const shouldRevalidate: ShouldRevalidateFunction = ({ formAction }) => {
  // Revalidate if formAction is present (it can return a toast)
  if (formAction) {
    return true
  }

  return false
}

export const meta: MetaFunction = () => {
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
  theme = 'light',
  env = {},
}: {
  children: React.ReactNode
  nonce: string
  theme?: Theme
  env?: Record<string, string>
}) {
  return (
    <html lang="en">
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
        <ManifestLink />
        <Meta />
        <Links />
      </head>
      <body className={cx('valley-themed', styles.root)} data-theme={theme}>
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

const App = () => {
  const loaderData = useLoaderData<typeof loader>()
  const theme = useTheme()

  useToast(loaderData.toast)

  // TODO: fix SW requests
  // useEffect(() => {
  //   // Registering SW manually because Vite remix-pwa plugin
  //   // adds <script> tag without CSP nonce value
  //   loadServiceWorker()
  // }, [])

  return (
    <HoneypotProvider {...loaderData.honeypotProps}>
      <Outlet />
      <Modals />
      <UploadsOverlay />
      <Toaster theme={theme} />
    </HoneypotProvider>
  )
}

export const ErrorBoundary = GeneralErrorBoundary
export default React.memo(App)
