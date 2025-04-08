import React from 'react'
import styles from './Button.module.css'
import ButtonBase, { ButtonBaseProps } from '../ButtonBase/ButtonBase'
import Spinner from '../Spinner/Spinner'
import { ViewportSize } from '../types/ViewportSize'
import { Slot, Slottable } from '@radix-ui/react-slot'
import { AsChildProps } from '../types/AsChildProps'
import { cn } from '@valley/shared'

export type ButtonOwnProps = Partial<
  React.PropsWithChildren<{
    size: Exclude<ViewportSize, 'xs'>
    fullWidth: boolean
    loading: boolean
    before: React.ReactNode
    after: React.ReactNode
    align: 'start' | 'center' | 'end'
    ref: React.Ref<HTMLButtonElement>
    iconSize: number
  }> &
    ButtonBaseProps
>

export type ButtonProps = AsChildProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> &
  ButtonOwnProps

const Button = ({
  children,
  size = 'sm',
  variant = 'primary',
  iconSize,
  loading,
  className,
  disabled,
  before,
  fullWidth,
  align,
  after,
  asChild,
  shimmer,
  ...other
}: ButtonProps) => {
  const Root = asChild ? Slot : 'button'

  if (!children && asChild) {
    console.error('Cannot use `asChild` without a children element:', {
      children,
      asChild,
    })
    return null
  }

  return (
    <ButtonBase
      asChild
      variant={variant}
      disabled={disabled}
      shimmer={shimmer}
      {...(iconSize && {
        style: { ['--button-icon-size' as string]: iconSize + 'px' },
      })}
      className={cn('Button', styles.button, className, {
        [styles['button--size-sm']]: size === 'sm',
        [styles['button--size-md']]: size === 'md',
        [styles['button--size-lg']]: size === 'lg',
        [styles['button--size-xl']]: size === 'xl',
        [styles['button--primary']]: variant === 'primary',
        [styles['button--fullWidth']]: fullWidth,
        [styles['button--align-start']]: align === 'start',
        [styles['button--align-end']]: align === 'end',
      })}
    >
      <Root {...other}>
        {loading && (
          <Spinner
            className={cn(styles.button__loading, {
              [styles['button__loading--noAnimation']]: !!before,
            })}
          />
        )}
        {before && !loading && (
          <div className={cn('Button__before', styles.button__before)}>
            {before}
          </div>
        )}
        {
          // Ugly fix for slotting children in the right place (inside <span>)
          children && asChild && (
            <Slottable>
              {React.cloneElement(
                children as React.ReactElement,
                undefined,
                <span className={cn('Button__content', styles.button__content)}>
                  {
                    (children as React.ReactElement<React.PropsWithChildren>)
                      ?.props?.children
                  }
                </span>
              )}
            </Slottable>
          )
        }
        {children && !asChild && (
          <span className={cn('Button__content', styles.button__content)}>
            {children}
          </span>
        )}
        {after && (
          <div className={cn('Button__after', styles.button__after)}>
            {after}
          </div>
        )}
      </Root>
    </ButtonBase>
  )
}

export default React.memo(Button)
