import React, { CSSProperties } from 'react'
import styles from './Stack.module.css'
import cx from 'classnames'
import {
  PolymorphicComponentPropWithRef,
  PolymorphicRef,
} from '../types/PolymorphicComponent'
import { CSSProp, ViewportSize } from '../types/ViewportSize'

export const STACK_GRID_UNIT = 4

type StackViewportSize = Exclude<ViewportSize, 'xs'>
export type StackOwnProps = React.PropsWithChildren<
  Partial<{
    direction: CSSProp<'flexDirection', StackViewportSize>
    align: CSSProp<'alignItems', StackViewportSize>
    justify: CSSProp<'justifyContent', StackViewportSize>
    gap: CSSProp<'gap', StackViewportSize>
    padding: CSSProp<'padding', StackViewportSize>
    flex: CSSProp<'flex', StackViewportSize>
  }>
>

export type StackProps<C extends React.ElementType> =
  PolymorphicComponentPropWithRef<C, StackOwnProps>

type StackComponent = <C extends React.ElementType = 'div'>(
  props: StackProps<C>
) => React.ReactElement | null

/** Format special properties to get multiplied by default stack grid unit */
function formatStackVariableValue(
  propertyName: string,
  value: string | number
) {
  if (propertyName === 'gap' || propertyName === 'padding') {
    return Number(value) * STACK_GRID_UNIT + 'px'
  }

  return value
}

function getStackVariables<T extends keyof CSSProperties>(
  property: CSSProp<T, StackViewportSize>,
  propertyName: string
): Record<string, string | number> {
  if (typeof property === 'string' || typeof property === 'number') {
    return {
      [`--stack-${propertyName}`]: formatStackVariableValue(
        propertyName,
        property
      ),
    }
  }

  const res: Record<string, string | number> = {}

  if (
    typeof property === 'object' &&
    !Array.isArray(property) &&
    property !== null
  ) {
    Object.entries(property).forEach(([key, value]) => {
      if (value === undefined) return

      res[`--${key}-stack-${propertyName}`] = formatStackVariableValue(
        propertyName,
        value
      )
    })
  }

  return res
}

const Stack = React.forwardRef(function Stack<
  C extends React.ElementType = 'div',
>(
  {
    children,
    direction = 'row',
    align = 'stretch',
    justify = 'flex-start',
    gap = 0,
    padding = 0,
    flex = 'initial',
    className,
    as,
    ...props
  }: StackProps<C>,
  ref: PolymorphicRef<C>
) {
  const Root = as || 'div'
  const stackFlex = getStackVariables(flex, 'flex')
  const stackAlign = getStackVariables(align, 'align')
  const stackJustify = getStackVariables(justify, 'justify')
  const stackPadding = getStackVariables(padding, 'padding')
  const stackGap = getStackVariables(gap, 'gap')
  const stackDirection = getStackVariables(direction, 'direction')

  return (
    <Root
      {...props}
      style={{
        ...stackFlex,
        ...stackAlign,
        ...stackJustify,
        ...stackPadding,
        ...stackGap,
        ...stackDirection,
      }}
      ref={ref}
      className={cx(styles.stack, className)}
    >
      {children}
    </Root>
  )
})

export default React.memo(Stack) as StackComponent
