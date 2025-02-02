import React from 'react'
import styles from './Stack.module.css'
import cx from 'classnames'
import { CSSProp, ViewportSize } from '../types/ViewportSize'
import { useViewportVariable } from '../useViewportVariable/useViewportVariable'
import { Slot } from '@radix-ui/react-slot'
import { AsChildProps } from '../types/AsChildProps'

type StackViewportSize = Exclude<ViewportSize, 'xs'>
export type StackOwnProps = Partial<
  React.PropsWithChildren<{
    direction: CSSProp<'flexDirection', StackViewportSize>
    align: CSSProp<'alignItems', StackViewportSize>
    justify: CSSProp<'justifyContent', StackViewportSize>
    gap: CSSProp<'gap', StackViewportSize>
    padding: CSSProp<'padding', StackViewportSize>
    flex: CSSProp<'flex', StackViewportSize>
    wrap: boolean
    fullWidth: boolean
    fullHeight: boolean
    style: React.CSSProperties
    className: string
  }>
>
export type StackProps = AsChildProps<React.ComponentPropsWithRef<'div'>> &
  StackOwnProps

const Stack = ({
  direction = 'row',
  align = 'stretch',
  justify = 'flex-start',
  gap = 0,
  padding = 0,
  flex = 'initial',
  fullWidth,
  fullHeight,
  wrap,
  asChild,
  className,
  style,
  ...other
}: StackProps) => {
  const { getViewportVariable } = useViewportVariable('stack')
  const Root = asChild ? Slot : 'div'
  const stackFlex = getViewportVariable(flex, 'flex')
  const stackAlign = getViewportVariable(align, 'align')
  const stackJustify = getViewportVariable(justify, 'justify')
  const stackPadding = getViewportVariable(padding, 'padding')
  const stackGap = getViewportVariable(gap, 'gap')
  const stackDirection = getViewportVariable(direction, 'direction')

  return (
    <Root
      {...other}
      className={cx('Stack', styles.stack, className, {
        [styles['stack--fullWidth']]: fullWidth,
        [styles['stack--fullHeight']]: fullHeight,
        [styles['stack--wrap']]: wrap,
      })}
      style={{
        ...style,
        ...stackFlex,
        ...stackAlign,
        ...stackJustify,
        ...stackPadding,
        ...stackGap,
        ...stackDirection,
      }}
    />
  )
}

export default Stack
