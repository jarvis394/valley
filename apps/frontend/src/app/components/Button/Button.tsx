import React from 'react'
import cx from 'classnames'
import styles from './button.module.css'

export type ButtonProps = React.PropsWithChildren<{
  size?: 'sm' | 'md' | 'lg'
  variant?:
    | 'primary'
    | 'secondary'
    | 'secondary-dimmed'
    | 'tertiary'
    | 'warning'
    | 'danger'
  disabled?: boolean
}>

const Button: React.FC<ButtonProps> = ({
  children,
  size = 'sm',
  variant = 'primary',
  disabled,
}) => {
  return (
    <button
      disabled={disabled}
      className={cx(styles.button, {
        [styles['button--primary']]: variant === 'primary',
        [styles['button--secondary']]: variant === 'secondary',
        [styles['button--secondary-dimmed']]: variant === 'secondary-dimmed',
        [styles['button--tertiary']]: variant === 'tertiary',
        [styles['button--warning']]: variant === 'warning',
        [styles['button--danger']]: variant === 'danger',
        [styles['button--size-sm']]: size === 'sm',
        [styles['button--size-md']]: size === 'md',
        [styles['button--size-lg']]: size === 'lg',
      })}
    >
      {children}
    </button>
  )
}

export default Button
