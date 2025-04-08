import React from 'react'
import type { Preview } from '@storybook/react'
import cx from 'classnames'
import styles from './App.module.css'

import './fonts.css'
import './global.css'
import '@valley/ui/styles'
import '@uppy/core/dist/style.min.css'

const preview: Preview = {
  decorators: [
    (Story) => (
      <div className={cx('valley-themed', styles.App)} data-theme="dark">
        <Story />
      </div>
    ),
  ],

  tags: ['autodocs'],
}

export default preview
