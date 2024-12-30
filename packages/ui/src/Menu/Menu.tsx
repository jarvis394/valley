import React, { useMemo, useState } from 'react'
import styles from './Menu.module.css'
import modalStyles from '../Modal/Modal.module.css'
import { Slot, Slottable } from '@radix-ui/react-slot'
import * as DropdownMenu from '../DropdownMenu/DropdownMenu'
import * as ContextMenu from '../ContextMenu/ContextMenu'
import Button, { ButtonProps } from '../Button/Button'
import cx from 'classnames'
import { SMALL_VIEWPORT_WIDTH } from '../config/theme'
import useMediaQuery from '../useMediaQuery/useMediaQuery'
import { Drawer } from 'vaul'
import { exhaustivnessCheck } from '@valley/shared'
import ButtonBase from '../ButtonBase/ButtonBase'

export type MenuProps = React.PropsWithChildren<
  {
    type?: 'dropdown' | 'context' | 'drawer'
  } & DropdownMenu.DropdownMenuContentProps
>

export const MenuTypeContext = React.createContext<MenuProps['type']>(undefined)
export const MenuTypeProvider = MenuTypeContext.Provider
export const useMenuType = () => React.useContext(MenuTypeContext)

export const MenuActionsContext = React.createContext<{
  close: () => void
}>({ close: () => {} })
export const MenuActionsProvider = MenuActionsContext.Provider
export const useMenuActions = () => React.useContext(MenuActionsContext)

export type MenuItemProps = ButtonProps & {
  label?: string
  id?: string
  onClick?: React.MouseEventHandler
}

export const Item = React.memo(
  React.forwardRef<HTMLButtonElement, MenuItemProps>(function MenuItem(
    { children, className, onClick: propsOnClick, ...props },
    ref
  ) {
    const { close } = useMenuActions()
    const menuType = useMenuType()
    const MenuItem = useMemo(() => {
      switch (menuType) {
        case undefined:
        case 'drawer':
          return ButtonBase
        case 'dropdown':
          return DropdownMenu.Item
        case 'context':
          return ContextMenu.Item
        default:
          return exhaustivnessCheck(menuType)
      }
    }, [menuType])
    const handleClick = (
      e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
      e.stopPropagation()
      propsOnClick?.(e)
      close()
    }

    return (
      <MenuItem asChild>
        <Button
          onClick={handleClick}
          align="start"
          size="sm"
          variant="tertiary"
          fullWidth
          className={cx(styles.menu__item, className, {
            [styles['menu__item--drawer']]: menuType === 'drawer',
          })}
          ref={ref}
          {...props}
        >
          {children}
        </Button>
      </MenuItem>
    )
  })
)

export type MenuSeparatorProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLSpanElement>,
  HTMLSpanElement
>

export const Separator: React.FC<MenuSeparatorProps> = ({
  className,
  ...props
}) => {
  return (
    <span
      role="separator"
      aria-orientation="horizontal"
      className={cx(styles.menu__separator, className)}
      {...props}
    />
  )
}

export const Content: React.FC<MenuProps> = ({ children, ...props }) => {
  const handleCloseAutoFocus = (event: Event) => {
    event.preventDefault()
  }

  return (
    <Slottable>
      <MenuTypeProvider value={'dropdown'}>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            onCloseAutoFocus={handleCloseAutoFocus}
            align="start"
            data-type="dropdown"
            className={styles.menu}
            {...props}
          >
            <div className={styles.menu__inner}>{children}</div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </MenuTypeProvider>

      <MenuTypeProvider value={'context'}>
        <ContextMenu.Portal>
          <ContextMenu.Content
            onCloseAutoFocus={handleCloseAutoFocus}
            align="start"
            data-type="context"
            className={styles.menu}
            {...props}
          >
            <div className={styles.menu__inner}>{children}</div>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </MenuTypeProvider>

      <MenuTypeProvider value={'drawer'}>
        <Drawer.Portal>
          <Drawer.Content
            data-type="drawer"
            className={cx(modalStyles.modal__drawer)}
            {...props}
          >
            <Drawer.Title hidden>Menu</Drawer.Title>
            <Drawer.Description hidden>Menu</Drawer.Description>
            <div className={styles.menu__inner}>{children}</div>
          </Drawer.Content>
          <Drawer.Overlay className={modalStyles.modal__dialogOverlay} />
        </Drawer.Portal>
      </MenuTypeProvider>
    </Slottable>
  )
}

export const ContextMenuTrigger = ({
  children,
  enabled,
}: React.PropsWithChildren<{
  enabled?: boolean
}>) => {
  if (!enabled) {
    return children
  }

  return <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
}

export const Root = ({
  dropdownMenuProps,
  contextMenuProps,
  openOnContextMenu = false,
  children,
}: React.PropsWithChildren<{
  dropdownMenuProps?: DropdownMenu.DropdownMenuProps
  contextMenuProps?: ContextMenu.ContextMenuProps
  openOnContextMenu?: boolean
}>) => {
  const shouldShowDrawer = useMediaQuery(
    `(max-width:${SMALL_VIEWPORT_WIDTH}px)`
  )
  const shouldShowMenu = !shouldShowDrawer
  const shouldEnableContextMenu = openOnContextMenu && !shouldShowDrawer
  const [dropdownMenuOpen, setDropdownMenuOpen] = useState(
    dropdownMenuProps?.defaultOpen
  )
  const { onOpenChange: propsOnOpenChange, ...restDropdownMenuProps } =
    dropdownMenuProps || {}

  const handleOpenChange = (newIsOpen: boolean) => {
    propsOnOpenChange?.(newIsOpen)
    setDropdownMenuOpen(newIsOpen)
  }

  const handleDrawerOpenChange = (newIsOpen: boolean) => {
    if (!newIsOpen) {
      return setDropdownMenuOpen(false)
    }
  }

  return (
    <MenuActionsProvider value={{ close: () => setDropdownMenuOpen(false) }}>
      <Drawer.Root
        direction="bottom"
        open={shouldShowDrawer && dropdownMenuOpen}
        onOpenChange={handleDrawerOpenChange}
        disablePreventScroll
        repositionInputs
      >
        <DropdownMenu.Root
          modal={false}
          open={shouldShowMenu && dropdownMenuOpen}
          onOpenChange={handleOpenChange}
          {...restDropdownMenuProps}
        >
          <ContextMenu.Root {...contextMenuProps}>
            <ContextMenuTrigger enabled={shouldEnableContextMenu}>
              {children}
            </ContextMenuTrigger>
            <Slot />
          </ContextMenu.Root>
        </DropdownMenu.Root>
      </Drawer.Root>
    </MenuActionsProvider>
  )
}

export const Trigger = DropdownMenu.Trigger

export default {
  Root,
  ContextMenuRoot: ContextMenuTrigger,
  Content,
  Trigger,
  Item,
  Separator,
  useMenuType,
  MenuTypeContext,
  MenuTypeProvider,
}
