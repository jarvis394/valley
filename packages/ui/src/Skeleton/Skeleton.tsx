import React from 'react'
import styles from './Skeleton.module.css'
import cx from 'classnames'
import { AsChildProps } from '../types/AsChildProps'
import { Slot } from '@radix-ui/react-slot'

export type SkeletonOwnProps = React.PropsWithChildren<{
  variant?: 'text' | 'rectangular' | 'circular'
  width?: string | number
  height?: string | number
  className?: string
}>

export type SkeletonProps = AsChildProps<
  React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLSpanElement>,
    HTMLSpanElement
  >
> &
  SkeletonOwnProps

const Skeleton: React.FC<SkeletonProps> = ({
  children,
  variant = 'text',
  className,
  width,
  height,
  asChild,
  ...props
}) => {
  const Root = asChild ? Slot : 'span'

  return (
    <Root
      style={{ width, height }}
      className={cx(styles.skeleton, className, {
        [styles['skeleton--text']]: variant === 'text',
        [styles['skeleton--circular']]: variant === 'circular',
        [styles['skeleton--rectangular']]: variant === 'rectangular',
      })}
      {...props}
    >
      {children}
    </Root>
  )
}

export default Skeleton
