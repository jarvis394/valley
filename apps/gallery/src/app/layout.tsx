import type { Metadata, Viewport } from 'next'

import '@valley/ui/styles/theme.css'
import '@valley/ui/styles/global.css'
import '../styles/fonts.css'
import '../styles/globals.css'

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
    <html lang="en">
      <body className="antialiased valley-themed" data-theme="dark">
        {children}
      </body>
    </html>
  )
}
