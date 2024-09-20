import React from 'react'
import styles from './ButtonBase.module.css'
import cx from 'classnames'
import { createPolymorphicComponent } from '../utils/createPolymorphicComponent'

export type ButtonBaseOwnProps = React.PropsWithChildren<{
  variant?:
    | 'primary'
    | 'secondary'
    | 'secondary-dimmed'
    | 'tertiary'
    | 'tertiary-dimmed'
    | 'warning'
    | 'danger'
  disabled?: boolean
}>

const ButtonBase = React.forwardRef<
  HTMLButtonElement,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ButtonBaseOwnProps & { component: any; className: string; renderRoot: any }
>(function ButtonBaseWithRef(
  { variant, renderRoot, className, component, ...other },
  ref
) {
  const Root = component || 'button'
  const props: React.ComponentProps<'button'> = {
    ...other,
    ref,
    className: cx(className, styles.buttonBase, {
      [styles['buttonBase--primary']]: variant === 'primary',
      [styles['buttonBase--secondary']]: variant === 'secondary',
      [styles['buttonBase--secondary-dimmed']]: variant === 'secondary-dimmed',
      [styles['buttonBase--tertiary']]: variant === 'tertiary',
      [styles['buttonBase--tertiary-dimmed']]: variant === 'tertiary-dimmed',
      [styles['buttonBase--warning']]: variant === 'warning',
      [styles['buttonBase--danger']]: variant === 'danger',
    }),
  }

  return typeof renderRoot === 'function' ? (
    renderRoot(props)
  ) : (
    <Root {...props} />
  )
})

export default createPolymorphicComponent<'button', ButtonBaseOwnProps>(
  ButtonBase
)
