import React from 'react'
import cx from 'classnames'
import styles from './IconButton.module.css'
import Button, { ButtonProps } from '../Button/Button'

const IconButton: React.FC<Omit<ButtonProps, 'before'>> = ({
  children,
  className,
  size,
  ...props
}) => {
  return (
    <Button
      {...props}
      size={size}
      className={cx(className, styles.iconButton, {
        [styles['iconButton--size-sm']]: size === 'sm',
        [styles['iconButton--size-md']]: size === 'md',
        [styles['iconButton--size-lg']]: size === 'lg',
      })}
    >
      {children}
    </Button>
  )
}

export default IconButton
