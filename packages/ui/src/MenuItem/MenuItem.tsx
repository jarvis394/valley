'use client'
import React from 'react'
import styles from './MenuItem.module.css'
import cx from 'classnames'
import Button, { ButtonProps } from '../Button/Button'
import { ListContext } from '@mui/base/useList'
import { useMenuItem, useMenuItemContextStabilizer } from '@mui/base'

type MenuItemProps = ButtonProps & {
  label?: string
}

const InnerMenuItem = React.memo(
  React.forwardRef<HTMLButtonElement, MenuItemProps>(function MenuItem(
    { children, className, id, disabled: disabledProp, label, ...props },
    ref
  ) {
    const { getRootProps, disabled, highlighted } = useMenuItem({
      id,
      disabled: disabledProp,
      rootRef: ref,
      label,
    })

    return (
      <Button
        {...getRootProps(props)}
        size="sm"
        variant="tertiary"
        fullWidth
        id={id}
        disabled={disabled}
        className={cx(styles.menuItem, className, {
          [styles['menuItem--highlighted']]: highlighted,
        })}
      >
        {children}
      </Button>
    )
  })
)

const MenuItem = React.forwardRef<HTMLButtonElement, MenuItemProps>(
  function MenuItem({ id: idProp, ...props }, ref) {
    // This wrapper component is used as a performance optimization.
    // `useMenuItemContextStabilizer` ensures that the context value
    // is stable across renders, so that the actual MenuItem re-renders
    // only when it needs to.
    const { contextValue, id } = useMenuItemContextStabilizer(idProp)

    return (
      <ListContext.Provider value={contextValue}>
        <InnerMenuItem {...props} ref={ref} id={id} />
      </ListContext.Provider>
    )
  }
)

export default React.memo(MenuItem)
