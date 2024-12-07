import React from 'react'
import cx from 'classnames'
import styles from './IconButton.module.css'
import Button, { ButtonProps } from '../Button/Button'
import Spinner from '../Spinner/Spinner'
import { AsChildProps } from '../types/AsChildProps'

export type IconButtonOwnProps = Omit<ButtonProps, 'before' | 'after' | 'align'>
export type IconButtonProps = AsChildProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> &
  IconButtonOwnProps

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { children, className, size = 'sm', loading, ...props },
    ref
  ) {
    return (
      <Button
        {...props}
        size={size}
        ref={ref}
        className={cx(className, styles.iconButton, {
          [styles['iconButton--size-sm']]: size === 'sm',
          [styles['iconButton--size-md']]: size === 'md',
          [styles['iconButton--size-lg']]: size === 'lg',
          [styles['iconButton--loading']]: loading,
        })}
      >
        {loading ? <Spinner /> : children}
      </Button>
    )
  }
)

export default React.memo(IconButton)
