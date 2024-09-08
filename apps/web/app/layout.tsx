import React from 'react'
import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import cx from 'classnames'
import styles from './App.module.css'
import { Modals } from './components/Modals'
import UploadsOverlay from './components/UploadsOverlay/UploadsOverlay'

import './styles/theme.css'
import './styles/global.css'
import '@uppy/core/dist/style.min.css'
import '@uppy/progress-bar/dist/style.min.css'
import 'overlayscrollbars/overlayscrollbars.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0e0e0e' },
  ],
  colorScheme: 'light dark',
}

export const metadata: Metadata = {
  title: 'Valley',
  description: 'Platform for your photography sessions',
  icons: [
    {
      rel: 'icon',
      url: '/favicon.ico',
      type: 'image/x-icon',
      sizes: '48x48',
    },
    {
      rel: 'mask-icon',
      url: '/safari-pinned-tab.svg',
      color: '#0a0a0a',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon-16x16.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon-32x32.png',
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      url: '/apple-touch-icon.png',
    },
  ],
}

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className={cx('App', styles.app)} data-theme="dark">
        {children}
        <Modals />
        <UploadsOverlay />
      </body>
    </html>
  )
}

export default React.memo(RootLayout)
