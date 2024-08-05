import React from 'react'
import type { Preview } from '@storybook/react'
import { GeistSans } from 'geist/font/sans'
import cx from 'classnames'
import styles from '../../web/app/App.module.css'

import '../../web/app/theme.css'
import '../../web/app/global.css'
import '@uppy/core/dist/style.min.css'
import '@uppy/progress-bar/dist/style.min.css'

const preview: Preview = {
  decorators: [
    (Story) => (
      <div
        className={cx('App', GeistSans.className, styles.app)}
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
