import React from 'react'
import styles from './Hidden.module.css'
import cx from 'classnames'
import { ViewportSize } from '../types/ViewportSize'
import { Slot } from '@radix-ui/react-slot'
import { AsChildProps } from '../types/AsChildProps'

export type HiddenOwnProps = Partial<
  React.PropsWithChildren<{
    style: React.CSSProperties
    className: string
  }> &
    Partial<Record<ViewportSize, boolean>>
>
export type HiddenProps = AsChildProps<React.ComponentPropsWithRef<'div'>> &
  HiddenOwnProps

const Hidden = React.forwardRef<HTMLDivElement, HiddenProps>(function Hidden(
  { lg, md, sm, xl, xs, asChild, className, style, ...other },
  ref
) {
  const Root = asChild ? Slot : 'div'

  return (
    <Root
      {...other}
      ref={ref}
      className={cx('Hidden', className, styles.hidden, {
        [styles['hidden--xs']]: xs,
        [styles['hidden--sm']]: sm,
        [styles['hidden--md']]: md,
        [styles['hidden--lg']]: lg,
        [styles['hidden--xl']]: xl,
      })}
      style={style}
    />
  )
})

export default Hidden
