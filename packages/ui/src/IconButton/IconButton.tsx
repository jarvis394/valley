import React from 'react'
import cx from 'classnames'
import styles from './IconButton.module.css'
import Button, { ButtonOwnProps } from '../Button/Button'
import Spinner from '../Spinner/Spinner'
import { createPolymorphicComponent } from '../utils/createPolymorphicComponent'

export type IconOwnProps = Omit<ButtonOwnProps, 'before' | 'after' | 'align'>

const IconButton = React.forwardRef<
  HTMLButtonElement,
  IconOwnProps & { className?: string }
>(({ children, className, size = 'sm', loading, ...props }, ref) => {
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
})

export default createPolymorphicComponent<'button', IconOwnProps>(IconButton)
