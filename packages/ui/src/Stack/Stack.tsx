import React from 'react'
import styles from './Stack.module.css'
import cx from 'classnames'
import { CSSProp, ViewportSize } from '../types/ViewportSize'
import { createPolymorphicComponent } from '../utils/createPolymorphicComponent'
import { useViewportVariable } from '../hooks/useViewportVariable'

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

const Stack = React.forwardRef<
  HTMLDivElement,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  StackOwnProps & { component: any; className?: string; renderRoot: any }
>(function Stack(
  {
    direction = 'row',
    align = 'stretch',
    justify = 'flex-start',
    gap = 0,
    padding = 0,
    flex = 'initial',
    className,
    component,
    renderRoot,
    ...other
  },
  ref
) {
  const { getViewportVariable } = useViewportVariable('stack')
  const Root = component || 'div'
  const stackFlex = getViewportVariable(flex, 'flex')
  const stackAlign = getViewportVariable(align, 'align')
  const stackJustify = getViewportVariable(justify, 'justify')
  const stackPadding = getViewportVariable(padding, 'padding')
  const stackGap = getViewportVariable(gap, 'gap')
  const stackDirection = getViewportVariable(direction, 'direction')
  const props: React.ComponentProps<'div'> = {
    ...other,
    style: {
      ...stackFlex,
      ...stackAlign,
      ...stackJustify,
      ...stackPadding,
      ...stackGap,
      ...stackDirection,
    },
    ref,
    className: cx(styles.stack, className),
  }

  return typeof renderRoot === 'function' ? (
    renderRoot(props)
  ) : (
    <Root {...props} />
  )
})

export default createPolymorphicComponent<'div', StackOwnProps>(Stack)
