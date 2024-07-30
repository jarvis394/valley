import React from 'react'
import type { Preview } from '@storybook/react'
import { GeistSans } from 'geist/font/sans'
import styles from '../src/app/styles.module.css'
import cx from 'classnames'
import '../app/theme.css'
import '../app/globals.css'

const preview: Preview = {
  decorators: [
    (Story) => (
      <div
        className={cx('App', GeistSans.className, styles.App)}
        data-theme="dark"
        style={{
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <Story />
      </div>
    ),
  ],
}

export default preview
