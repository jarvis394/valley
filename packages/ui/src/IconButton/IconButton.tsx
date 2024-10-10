import React from 'react'
import cx from 'classnames'
import styles from './IconButton.module.css'
import Button, { ButtonProps } from '../Button/Button'
import Spinner from '../Spinner/Spinner'

export type IconProps = Omit<ButtonProps, 'before' | 'after' | 'align'>

const IconButton = React.forwardRef<HTMLButtonElement, IconProps>(
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
        {loading && <Spinner />}
        {!loading && children}
      </Button>
    )
  }
)

export default IconButton
