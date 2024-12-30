import React from 'react'
import styles from './TabsItem.module.css'
import cx from 'classnames'
import { AsChildProps } from '../types/AsChildProps'
import { Slot } from '@radix-ui/react-slot'

export type TabsItemOwnProps = React.PropsWithChildren<{
  onClick?: (
    value: string | number,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void
  value?: string | number
  indicator?: boolean
  selected?: boolean
  className?: string
}>
export type TabsItemProps = AsChildProps<
  React.ComponentPropsWithRef<'button'>
> &
  TabsItemOwnProps

const TabsItem = React.forwardRef<HTMLButtonElement, TabsItemProps>(
  function TabsItemWithRef(
    {
      value,
      onClick,
      asChild,
      selected,
      className,
      indicator: _indicator,
      ...other
    },
    ref
  ) {
    const Root = asChild ? Slot : 'button'
    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
      if (value !== undefined) {
        onClick?.(value, e)
      }
    }

    return (
      <Root
        {...other}
        onClick={handleClick}
        ref={ref}
        className={cx(styles.tabsItem, className, {
          [styles['tabsItem--selected']]: selected,
        })}
      />
    )
  }
)

export default React.memo(TabsItem)
