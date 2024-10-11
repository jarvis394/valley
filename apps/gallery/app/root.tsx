import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import cx from 'classnames'
import styles from './App.module.css'
import type { LinksFunction } from '@remix-run/node'

import './styles/fonts.css'
import './styles/global.css'
import '@valley/ui/styles/theme.css'
import '@valley/ui/styles/global.css'
import 'overlayscrollbars/overlayscrollbars.css'

export const links: LinksFunction = () => []

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Gallery | Valley</title>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <link
          rel="preload"
          href="/fonts/webfonts/Geist[wght].woff2"
          as="font"
          crossOrigin=""
          type="font/woff2"
        />
        <link
          rel="preload"
          href="/fonts/variable/Geist[wght].ttf"
          as="font"
          crossOrigin=""
          type="font/ttf"
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content="#ffffff"
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="#0e0e0e"
        />
        <meta name="color-scheme" content="light dark" />
        <Meta />
        <Links />
      </head>
      <body className={cx('valley-themed', styles.App)} data-theme="dark">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}
