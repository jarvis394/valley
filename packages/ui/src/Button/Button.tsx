import React from 'react'
import cx from 'classnames'
import styles from './Button.module.css'
import ButtonBase, { ButtonBaseProps } from '../ButtonBase/ButtonBase'
import Spinner from '../Spinner/Spinner'
import { ViewportSize } from '../types/ViewportSize'
import { Slot, Slottable } from '@radix-ui/react-slot'

export type ButtonProps = Partial<
  React.PropsWithChildren<{
    size: Exclude<ViewportSize, 'xs' | 'xl'>
    fullWidth: boolean
    loading: boolean
    before: React.ReactNode
    after: React.ReactNode
    align: 'start' | 'center' | 'end'
  }> &
    ButtonBaseProps
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
    align,
    after,
    asChild,
    ...other
  },
  ref
) {
  const Root = asChild ? Slot : 'button'
  return (
    <ButtonBase
      ref={ref}
      asChild
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
      <Root {...other}>
        {loading && <Spinner className={styles.button__loading} />}
        {before && !loading && (
          <div className={styles.button__before}>{before}</div>
        )}
        {children && (
          <Slottable>
            <span className={styles.button__content}>{children}</span>
          </Slottable>
        )}
        {after && <div className={styles.button__after}>{after}</div>}
      </Root>
    </ButtonBase>
  )
})

export default Button
