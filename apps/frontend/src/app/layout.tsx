import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import cx from 'classnames'
import styles from './styles.module.css'
import './theme.css'

export const metadata: Metadata = {
  title: 'Valley',
  description: 'Platform for your photography sessions',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className={cx('App', styles.App)} data-theme="dark">
        {children}
      </body>
    </html>
  )
}
