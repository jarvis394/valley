import React from 'react'
import type { Preview } from '@storybook/react'
import { Inter } from 'next/font/google'
import cx from 'classnames'
import styles from '../../web/app/App.module.css'

import '../../web/app/theme.css'
import '../../web/app/global.css'
import '@uppy/core/dist/style.min.css'
import '@uppy/progress-bar/dist/style.min.css'

const font = Inter({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
})

const preview: Preview = {
  decorators: [
    (Story) => (
      <div
        className={cx('App', font.className, styles.app)}
        data-theme="dark"
        style={{
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          ['--font-geist-sans' as string]: 'Inter',
        }}
      >
        <Story />
      </div>
    ),
  ],
}

export default preview
