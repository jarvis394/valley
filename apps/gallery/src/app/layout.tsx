import type { Metadata } from 'next'

import '@valley/ui/styles/theme.css'
import '@valley/ui/styles/global.css'
import '../styles/fonts.css'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Gallery | Valley',
  description: 'Gallery for a Valley project',
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
