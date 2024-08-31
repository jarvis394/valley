import React from 'react'
import cx from 'classnames'
import styles from './Button.module.css'
import ButtonBase from '../ButtonBase/ButtonBase'
import Spinner from '../Spinner/Spinner'

export type ButtonProps = React.PropsWithChildren<{
  size?: 'sm' | 'md' | 'lg'
  variant?:
    | 'primary'
    | 'secondary'
    | 'secondary-dimmed'
    | 'tertiary'
    | 'tertiary-dimmed'
    | 'warning'
    | 'danger'
  disabled?: boolean
  fullWidth?: boolean
  loading?: boolean
  before?: React.ReactElement
}> &
  React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    size = 'sm',
    variant = 'primary',
    loading,
    className,
    disabled,
    before,
    fullWidth,
    ...props
  },
  ref
) {
  return (
    <ButtonBase
      {...props}
      ref={ref}
      variant={variant}
      disabled={disabled}
      className={cx(styles.button, className, {
        [styles['button--size-sm']]: size === 'sm',
        [styles['button--size-md']]: size === 'md',
        [styles['button--size-lg']]: size === 'lg',
        [styles['button--fullWidth']]: fullWidth,
      })}
    >
      {loading && <Spinner />}
      {before && !loading && (
        <div className={styles.button__before}>{before}</div>
      )}
      {children && <span className={styles.button__content}>{children}</span>}
    </ButtonBase>
  )
})

export default React.memo(Button)
