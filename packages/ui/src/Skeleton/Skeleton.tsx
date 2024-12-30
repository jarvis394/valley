import React from 'react'
import styles from './Skeleton.module.css'
import cx from 'classnames'

export type SkeletonProps = React.PropsWithChildren<{
  variant?: 'text' | 'rectangular' | 'circular'
  width?: string | number
  height?: string | number
}> &
  React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLSpanElement>,
    HTMLSpanElement
  >

const Skeleton: React.FC<SkeletonProps> = ({
  children,
  variant = 'text',
  className,
  width,
  height,
  ...props
}) => {
  return (
    <span
      style={{ width, height }}
      className={cx(styles.skeleton, className, {
        [styles['skeleton--text']]: variant === 'text',
        [styles['skeleton--circular']]: variant === 'circular',
        [styles['skeleton--rectangular']]: variant === 'rectangular',
      })}
      {...props}
    >
      {children}
    </span>
  )
}

export default Skeleton
