'use client'
import React from 'react'
import styles from './TabsItem.module.css'
import cx from 'classnames'

export type TabsItemProps = React.PropsWithChildren<{
  onClick?: (
    value: string | number,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void
  value?: string | number
  indicator?: boolean
  selected?: boolean
}> &
  Omit<
    React.DetailedHTMLProps<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >,
    'onClick'
  >

const TabsItem: React.FC<TabsItemProps> = React.forwardRef(
  function TabsItemWithRef(
    { value, onClick, selected, children, indicator: _indicator, ...props },
    ref
  ) {
    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
      value !== undefined && onClick?.(value, e)
    }

    return (
      <button
        {...props}
        className={cx(styles.tabsItem, {
          [styles['tabsItem--selected']]: selected,
        })}
        onClick={handleClick}
        ref={ref}
      >
        {children}
      </button>
    )
  }
)

export default React.memo(TabsItem)
