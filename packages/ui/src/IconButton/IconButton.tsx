import React from 'react'
import cx from 'classnames'
import styles from './IconButton.module.css'
import Button, { ButtonProps } from '../Button/Button'
import Spinner from '../Spinner/Spinner'

const IconButton: React.FC<Omit<ButtonProps, 'before' | 'ref'>> = ({
  children,
  className,
  size = 'sm',
  loading,
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
        [styles['iconButton--loading']]: loading,
      })}
    >
      {loading && <Spinner />}
      {!loading && children}
    </Button>
  )
}

export default IconButton
