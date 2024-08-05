import React from 'react'
import cx from 'classnames'
import styles from './Paper.module.css'
import {
  OverridableComponent,
  OverrideProps,
} from '../types/OverridableComponent'

type PaperProps = Partial<{
  variant:
    | 'primary'
    | 'secondary'
    | 'secondary-dimmed'
    | 'tertiary'
    | 'warning'
    | 'danger'
  button: boolean
}>

type PaperTypeMap<D extends React.ElementType = 'div'> = {
  props: PaperProps
  defaultComponent: D
}

export type PaperComponentProps = OverrideProps<PaperTypeMap, 'div'> & {
  component?: React.ElementType
}

const Paper = (({
  button,
  variant,
  children,
  className,
  component = 'div',
  ...props
}: PaperComponentProps) => {
  return React.createElement(
    component,
    {
      ...props,
      className: cx(className, styles.paper, {
        [styles['paper--primary']]: variant === 'primary',
        [styles['paper--secondary']]: variant === 'secondary',
        [styles['paper--secondary-dimmed']]: variant === 'secondary-dimmed',
        [styles['paper--tertiary']]: variant === 'tertiary',
        [styles['paper--warning']]: variant === 'warning',
        [styles['paper--danger']]: variant === 'danger',
        [styles['paper--button']]: button,
      }),
    },
    children
  )
}) as OverridableComponent<PaperTypeMap>

export default Paper
