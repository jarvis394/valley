import React, { CSSProperties } from 'react'
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
    | 'danger-dimmed'
  disabled?: boolean
  onClick?: React.MouseEventHandler
  shimmer?: boolean
  className?: string
  style?: CSSProperties
  ref?: React.Ref<HTMLButtonElement>
}>
export type ButtonBaseProps = AsChildProps<
  React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
> &
  ButtonBaseOwnProps

const ButtonBase = ({
  variant,
  className,
  disabled,
  asChild,
  shimmer,
  ...other
}: ButtonBaseProps) => {
  const Root = asChild ? Slot : 'button'

  return (
    <Root
      {...other}
      disabled={disabled || shimmer}
      className={cx(className, 'ButtonBase', styles.buttonBase, {
        [styles['buttonBase--primary']]: variant === 'primary',
        [styles['buttonBase--secondary']]: variant === 'secondary',
        [styles['buttonBase--secondary-dimmed']]:
          variant === 'secondary-dimmed',
        [styles['buttonBase--tertiary']]: variant === 'tertiary',
        [styles['buttonBase--tertiary-dimmed']]: variant === 'tertiary-dimmed',
        [styles['buttonBase--warning']]: variant === 'warning',
        [styles['buttonBase--danger']]: variant === 'danger',
        [styles['buttonBase--danger-dimmed']]: variant === 'danger-dimmed',
        [styles['buttonBase--shimmer']]: shimmer,
        shimmer: shimmer,
      })}
    />
  )
}

export default React.memo(ButtonBase)
