import React from 'react'
import styles from './Divider.module.css'
import cx from 'classnames'

type DividerProps = React.PropsWithChildren<{
  orientation?: 'horizontal' | 'vertical'
}>

const Divider: React.FC<DividerProps> = ({ orientation = 'horizontal' }) => {
  return (
    <span
      className={cx(styles.divider, {
        [styles['divider--horizontal']]: orientation === 'horizontal',
        [styles['divider--vertical']]: orientation === 'vertical',
      })}
    />
  )
}

export default Divider
