import React from 'react'
import cx from 'classnames'
import styles from './Button.module.css'

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
  before?: React.ReactElement
}> &
  React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >

const Button: React.FC<ButtonProps> = ({
  children,
  size = 'sm',
  variant = 'primary',
  className,
  disabled,
  before,
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={disabled}
      className={cx(styles.button, className, {
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
      {before && <div className={styles.button__before}>{before}</div>}
      {children && <span className={styles.button__content}>{children}</span>}
    </button>
  )
}

export default Button
