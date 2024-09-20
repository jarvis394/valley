'use client'
import React from 'react'
import styles from './TabsItem.module.css'
import cx from 'classnames'
import { createPolymorphicComponent } from '../utils/createPolymorphicComponent'

export type TabsItemProps = React.PropsWithChildren<{
  onClick?: (
    value: string | number,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void
  value?: string | number
  indicator?: boolean
  selected?: boolean
}>

const TabsItem = React.forwardRef<
  HTMLButtonElement,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TabsItemProps & { component: any; className?: string; renderRoot: any }
>(function TabsItemWithRef(
  {
    value,
    onClick,
    selected,
    component,
    renderRoot,
    className,
    indicator: _indicator,
    ...other
  },
  ref
) {
  const Root = component || 'button'
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    value !== undefined && onClick?.(value, e)
  }
  const props: React.ComponentProps<'button'> = {
    onClick: handleClick,
    className: cx(styles.tabsItem, className, {
      [styles['tabsItem--selected']]: selected,
    }),
    ref,
    ...other,
  }

  return typeof renderRoot === 'function' ? (
    renderRoot(props)
  ) : (
    <Root {...props} />
  )
})

export default createPolymorphicComponent<'button', TabsItemProps>(TabsItem)
