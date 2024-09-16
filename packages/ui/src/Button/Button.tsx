import React from 'react'
import cx from 'classnames'
import styles from './Button.module.css'
import ButtonBase, { ButtonBaseOwnProps } from '../ButtonBase/ButtonBase'
import Spinner from '../Spinner/Spinner'
import {
  PolymorphicComponentPropWithRef,
  PolymorphicRef,
} from '../types/PolymorphicComponent'
import { ViewportSize } from '../types/ViewportSize'

type ButtonOwnProps = React.PropsWithChildren<{
  size?: Exclude<ViewportSize, 'xs' | 'xl'>
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
  before?: React.ReactNode
  after?: React.ReactNode
  align?: 'start' | 'center' | 'end'
}>

export type ButtonProps<C extends React.ElementType = 'button'> =
  PolymorphicComponentPropWithRef<C, ButtonOwnProps>

type ButtonComponent = <C extends React.ElementType = 'button'>(
  props: ButtonProps<C>
) => React.ReactElement | null

const Button = React.forwardRef(function Button<
  C extends React.ElementType = 'button',
>(
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
    as,
    after,
    ...props
  }: ButtonProps<C>,
  ref: PolymorphicRef<C>
) {
  return (
    <ButtonBase
      {...props}
      as={as}
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
      {loading && <Spinner />}
      {before && !loading && (
        <div className={styles.button__before}>{before}</div>
      )}
      {children && <span className={styles.button__content}>{children}</span>}
      {after && <div className={styles.button__after}>{after}</div>}
    </ButtonBase>
  )
})

export default React.memo(Button) as ButtonComponent
