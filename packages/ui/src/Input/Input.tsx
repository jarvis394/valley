import cx from 'classnames'
import React from 'react'
import Paper, { PaperProps } from '../Paper/Paper'
import styles from './Input.module.css'

type InputProps = {
  before?: React.ReactNode
  after?: React.ReactNode
  state?: 'default' | 'error' | 'valid'
  size?: 'md' | 'lg'
  paperProps?: Omit<PaperProps, 'asChild'>
} & Omit<React.ComponentPropsWithRef<'input'>, 'size'>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function InputWithRef(
    {
      className,
      before,
      after,
      paperProps,
      state = 'default',
      size = 'md',
      ...props
    },
    ref
  ) {
    return (
      <Paper
        {...paperProps}
        variant="secondary"
        className={cx(styles.input, 'Input', paperProps?.className, {
          [styles['input--withBefore']]: !!before,
          [styles['input--withAfter']]: !!after,
          [styles['input--error']]: state === 'error',
          [styles['input--valid']]: state === 'valid',
          [styles['input--size-md']]: size === 'md',
          [styles['input--size-lg']]: size === 'lg',
        })}
      >
        {before && <div className={styles.input__before}>{before}</div>}
        <input
          {...props}
          className={cx(styles.input__input, className)}
          ref={ref}
        />
        {after && <div className={styles.input__after}>{after}</div>}
      </Paper>
    )
  }
)

export default Input
