import React from 'react'
import styles from './ButtonBase.module.css'
import cx from 'classnames'
import { AsChildProps } from '../types/AsChildProps'
import { Slot } from '@radix-ui/react-slot'

export type ButtonBaseOwnProps = React.PropsWithChildren<{
  variant?:
    | 'primary'
    | 'secondary'
    | 'secondary-dimmed'
    | 'tertiary'
    | 'tertiary-dimmed'
    | 'warning'
    | 'danger'
  disabled?: boolean
  onClick?: React.MouseEventHandler
  className?: string
}>
export type ButtonBaseProps = AsChildProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> &
  ButtonBaseOwnProps

const ButtonBase = React.forwardRef<HTMLButtonElement, ButtonBaseProps>(
  function ButtonBaseWithRef({ variant, className, asChild, ...other }, ref) {
    const Root = asChild ? Slot : 'button'

    return (
      <Root
        {...other}
        ref={ref}
        className={cx(className, styles.buttonBase, {
          [styles['buttonBase--primary']]: variant === 'primary',
          [styles['buttonBase--secondary']]: variant === 'secondary',
          [styles['buttonBase--secondary-dimmed']]:
            variant === 'secondary-dimmed',
          [styles['buttonBase--tertiary']]: variant === 'tertiary',
          [styles['buttonBase--tertiary-dimmed']]:
            variant === 'tertiary-dimmed',
          [styles['buttonBase--warning']]: variant === 'warning',
          [styles['buttonBase--danger']]: variant === 'danger',
        })}
      />
    )
  }
)

export default ButtonBase
