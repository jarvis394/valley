import cx from 'classnames'
import React from 'react'
import Paper, { PaperComponentProps } from '@app/components/Paper/Paper'
import styles from './Input.module.css'

type InputProps = {
  before?: React.ReactNode
  after?: React.ReactNode
  state?: 'default' | 'error' | 'valid'
  inputSize?: 'md' | 'lg'
  paperProps?: PaperComponentProps
} & React.ComponentPropsWithRef<'input'>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function InputWithRef(
    {
      className,
      before,
      after,
      paperProps,
      state = 'default',
      inputSize = 'md',
      ...props
    },
    ref
  ) {
    return (
      <Paper
        {...paperProps}
        variant="secondary"
        className={cx(styles.input, paperProps?.className, {
          [styles['input--withBefore']]: !!before,
          [styles['input--withAfter']]: !!after,
          [styles['input--error']]: state === 'error',
          [styles['input--valid']]: state === 'valid',
          [styles['input--size-md']]: inputSize === 'md',
          [styles['input--size-lg']]: inputSize === 'lg',
        })}
      >
        {before && <div className={styles.input__before}>{before}</div>}
        <input
          {...props}
          className={cx(styles.input__input, className)}
          ref={ref}
        />
        {after && <div className="Input__after">{after}</div>}
      </Paper>
    )
  }
)

export default Input
