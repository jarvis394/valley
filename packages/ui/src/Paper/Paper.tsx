import React, { CSSProperties } from 'react'
import cx from 'classnames'
import styles from './Paper.module.css'
import { Slot } from '@radix-ui/react-slot'
import { AsChildProps } from '../types/AsChildProps'

export type PaperOwnProps = React.PropsWithChildren<
  Partial<{
    variant:
      | 'primary'
      | 'secondary'
      | 'secondary-dimmed'
      | 'tertiary'
      | 'warning'
      | 'danger'
      | 'border'
    rounded: boolean
    button: boolean
    className: string
    style: CSSProperties
  }>
>
export type PaperProps = AsChildProps<React.ComponentPropsWithRef<'div'>> &
  PaperOwnProps

const Paper = React.forwardRef<HTMLDivElement, PaperProps>(function Paper(
  { button, variant, rounded, className, asChild, ...other },
  ref
) {
  const Root = asChild ? Slot : 'div'

  return (
    <Root
      {...other}
      ref={ref}
      className={cx(className, styles.paper, {
        [styles['paper--primary']]: variant === 'primary',
        [styles['paper--secondary']]: variant === 'secondary',
        [styles['paper--secondary-dimmed']]: variant === 'secondary-dimmed',
        [styles['paper--tertiary']]: variant === 'tertiary',
        [styles['paper--warning']]: variant === 'warning',
        [styles['paper--danger']]: variant === 'danger',
        [styles['paper--border']]: variant === 'border',
        [styles['paper--button']]: button,
        [styles['paper--rounded']]: rounded,
      })}
    />
  )
})

export default Paper
