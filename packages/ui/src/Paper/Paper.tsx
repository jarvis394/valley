import React from 'react'
import cx from 'classnames'
import styles from './Paper.module.css'
import { createPolymorphicComponent } from '../utils/createPolymorphicComponent'

export type PaperOwnProps = Partial<
  React.PropsWithChildren<{
    variant:
      | 'primary'
      | 'secondary'
      | 'secondary-dimmed'
      | 'tertiary'
      | 'warning'
      | 'danger'
    button: boolean
  }>
>

const Paper = React.forwardRef<
  HTMLDivElement,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PaperOwnProps & { component: any; className?: string; renderRoot: any }
>(function Paper(
  { button, variant, className, component, renderRoot, ...other },
  ref
) {
  const Root = component || 'div'
  const props: React.ComponentProps<'div'> = {
    ...other,
    ref,
    className: cx(className, styles.paper, {
      [styles['paper--primary']]: variant === 'primary',
      [styles['paper--secondary']]: variant === 'secondary',
      [styles['paper--secondary-dimmed']]: variant === 'secondary-dimmed',
      [styles['paper--tertiary']]: variant === 'tertiary',
      [styles['paper--warning']]: variant === 'warning',
      [styles['paper--danger']]: variant === 'danger',
      [styles['paper--button']]: button,
    }),
  }

  return typeof renderRoot === 'function' ? (
    renderRoot(props)
  ) : (
    <Root {...props} />
  )
})

export default createPolymorphicComponent<'div', PaperOwnProps>(Paper)
