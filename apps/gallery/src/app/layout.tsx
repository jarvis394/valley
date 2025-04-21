/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata, Viewport } from 'next'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import Head from 'next/head'

dayjs.extend(utc)
dayjs.extend(timezone)

import '../styles/globals.css'
import '../styles/fonts.css'

export const metadata: Metadata = {
  title: 'Gallery | Valley',
  description: 'Gallery for a Valley project',
  icons: [
    {
      rel: 'icon',
      url: '/favicon.ico',
      type: 'image/x-icon',
      sizes: '48x48',
    },
    {
      rel: 'icon',
      url: '/favicon-16x16.png',
      type: 'image/png',
      sizes: '16x16',
    },
    {
      rel: 'icon',
      url: '/favicon-32x32.png',
      type: 'image/png',
      sizes: '32x32',
    },
    {
      rel: 'appe-toulch-icon',
      url: '/apple-touch-icon.png',
      type: 'image/png',
      sizes: '180x180',
    },
    {
      rel: 'mask-icon',
      url: '/safari-pinned-tab.svg',
      color: '#0a0a0a',
    },
  ],
}

export const viewport: Viewport = {
  colorScheme: 'dark light',
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0e0e0e' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-theme="dark">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&family=Forum&family=Jost:ital,wght@0,100..900;1,100..900&family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&family=Spectral:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
