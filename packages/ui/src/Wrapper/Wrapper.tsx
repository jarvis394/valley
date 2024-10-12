import React from 'react'
import styles from './Wrapper.module.css'
import cx from 'classnames'
import Paper, { PaperProps } from '../Paper/Paper'

export type WrapperProps = PaperProps

const Wrapper: React.FC<WrapperProps> = ({
  children,
  className,
  variant = 'tertiary',
  ...props
}) => {
  return (
    <Paper
      {...props}
      variant={variant}
      className={cx('Wrapper', styles.wrapper, className)}
    >
      {children}
    </Paper>
  )
}

export default Wrapper
