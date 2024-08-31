import React from 'react'
import cx from 'classnames'
import styles from './Paper.module.css'
import { OverridableComponent, OverrideProps } from '@mui/types'

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
    ref: React.Ref<unknown>
  }>
>

export type PaperTypeMap<
  AdditionalProps = unknown,
  RootComponent extends React.ElementType = 'div'
> = {
  props: AdditionalProps & PaperOwnProps
  defaultComponent: RootComponent
}

export type PaperProps<
  RootComponent extends React.ElementType = PaperTypeMap['defaultComponent'],
  AdditionalProps = unknown
> = OverrideProps<
  PaperTypeMap<AdditionalProps, RootComponent>,
  RootComponent
> & {
  component?: React.ElementType
}

const Paper = React.forwardRef(function Paper(
  { button, variant, children, className, component, ...props }: PaperProps,
  ref
) {
  const Root = component || 'div'

  return (
    <Root
      {...props}
      ref={ref}
      className={cx(className, styles.paper, {
        [styles['paper--primary']]: variant === 'primary',
        [styles['paper--secondary']]: variant === 'secondary',
        [styles['paper--secondary-dimmed']]: variant === 'secondary-dimmed',
        [styles['paper--tertiary']]: variant === 'tertiary',
        [styles['paper--warning']]: variant === 'warning',
        [styles['paper--danger']]: variant === 'danger',
        [styles['paper--button']]: button,
      })}
    >
      {children}
    </Root>
  )
})

export default React.memo(Paper) as OverridableComponent<PaperTypeMap>
