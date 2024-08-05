import React from 'react'
import cx from 'classnames'
import styles from './Button.module.css'
import ButtonBase from '../ButtonBase/ButtonBase'

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
  fullWidth?: boolean
  before?: React.ReactElement
}> &
  React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >

const Button = React.forwardRef<'button', ButtonProps>(
  (
    {
      children,
      size = 'sm',
      variant = 'primary',
      className,
      disabled,
      before,
      fullWidth,
      ...props
    },
    ref
  ) => {
    return (
      <ButtonBase
        {...props}
        ref={ref}
        component={'button'}
        variant={variant}
        disabled={disabled}
        className={cx(styles.button, className, {
          [styles['button--size-sm']]: size === 'sm',
          [styles['button--size-md']]: size === 'md',
          [styles['button--size-lg']]: size === 'lg',
          [styles['button--fullWidth']]: fullWidth,
        })}
      >
        {before && <div className={styles.button__before}>{before}</div>}
        {children && <span className={styles.button__content}>{children}</span>}
      </ButtonBase>
    )
  }
)

export default Button
