import cx from 'classnames'
import React from 'react'
import Paper, { PaperProps } from '../Paper/Paper'
import styles from './Input.module.css'
import { FormControlState, useFormControl } from '../FormControl'

export type InputProps = {
  before?: React.ReactNode
  after?: React.ReactNode
  state?: FormControlState['state']
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
      state: propsState,
      size = 'md',
      ...props
    },
    ref
  ) {
    const formControl = useFormControl()
    const state = propsState || formControl?.state

    return (
      <Paper
        {...paperProps}
        variant="secondary"
        className={cx(styles.input, 'Input', paperProps?.className, {
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
