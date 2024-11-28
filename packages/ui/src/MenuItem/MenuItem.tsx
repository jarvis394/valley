import React from 'react'
import styles from './MenuItem.module.css'
import cx from 'classnames'
import Button, { ButtonProps } from '../Button/Button'
import { useMenuType } from '../Menu/Menu'
import * as DropdownMenu from '../DropdownMenu/DropdownMenu'
import * as ContextMenu from '../ContextMenu/ContextMenu'

type MenuItemProps = ButtonProps & {
  label?: string
  id?: string
  onClick?: React.MouseEventHandler
}

const MenuItem = React.memo(
  React.forwardRef<HTMLButtonElement, MenuItemProps>(function MenuItem(
    { children, className, onClick: propsOnClick, ...props },
    ref
  ) {
    const menuType = useMenuType()
    const MenuType = menuType === 'dropdown' ? DropdownMenu : ContextMenu
    const handleClick = (
      e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
      e.stopPropagation()
      propsOnClick?.(e)
    }

    return (
      <MenuType.Item asChild>
        <Button
          onClick={handleClick}
          align="start"
          size="sm"
          variant="tertiary"
          fullWidth
          className={cx(styles.menuItem, className)}
          ref={ref}
          {...props}
        >
          {children}
        </Button>
      </MenuType.Item>
    )
  })
)

export default React.memo(MenuItem)
