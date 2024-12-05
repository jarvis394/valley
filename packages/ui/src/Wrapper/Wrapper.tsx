import React from 'react'
import styles from './Wrapper.module.css'
import cx from 'classnames'
import Paper, { PaperProps } from '../Paper/Paper'

export type WrapperProps = PaperProps

const Wrapper = React.forwardRef<HTMLDivElement, WrapperProps>(
  function WrapperWithRef(
    { children, className, variant = 'tertiary', ...props },
    ref
  ) {
    return (
      <Paper
        {...props}
        ref={ref}
        variant={variant}
        className={cx('Wrapper', styles.wrapper, className)}
      >
        {children}
      </Paper>
    )
  }
)

export default Wrapper
