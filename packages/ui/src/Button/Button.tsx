import React, { CSSProperties } from 'react'
import cx from 'classnames'
import styles from './Button.module.css'
import ButtonBase, { ButtonBaseOwnProps } from '../ButtonBase/ButtonBase'
import Spinner from '../Spinner/Spinner'
import { ViewportSize } from '../types/ViewportSize'
import { createPolymorphicComponent } from '../utils/createPolymorphicComponent'

export type ButtonOwnProps = React.PropsWithChildren<{
  size?: Exclude<ViewportSize, 'xs' | 'xl'>
  fullWidth?: boolean
  loading?: boolean
  before?: React.ReactNode
  after?: React.ReactNode
  align?: 'start' | 'center' | 'end'
}> &
  ButtonBaseOwnProps

const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonOwnProps & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: any
    className?: string
    style?: CSSProperties
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderRoot: any
  }
>(function Button(
  {
    children,
    size = 'sm',
    variant = 'primary',
    loading,
    className,
    disabled,
    before,
    fullWidth,
    align,
    after,
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
        [styles['button--align-start']]: align === 'start',
        [styles['button--align-end']]: align === 'end',
      })}
    >
      {loading && <Spinner className={styles.button__loading} />}
      {before && !loading && (
        <div className={styles.button__before}>{before}</div>
      )}
      {children && <span className={styles.button__content}>{children}</span>}
      {after && <div className={styles.button__after}>{after}</div>}
    </ButtonBase>
  )
})

export default createPolymorphicComponent<'button', ButtonOwnProps>(Button)
