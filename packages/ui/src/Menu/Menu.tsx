import React, { useCallback, useMemo, useState } from 'react'
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
import { External } from 'geist-ui-icons'

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
  href?: string
}

export const Item = React.memo(
  React.forwardRef<HTMLButtonElement, MenuItemProps>(function MenuItem(
    { children, className, href, onClick: propsOnClick, ...props },
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
    const commonProps: ButtonProps = {
      onClick: handleClick,
      align: 'start',
      size: 'sm',
      variant: 'tertiary',
      fullWidth: true,
      className: cx(styles.menu__item, className, {
        [styles['menu__item--drawer']]: menuType === 'drawer',
      }),
    }

    if (href) {
      return (
        <MenuItem asChild>
          <Button
            {...commonProps}
            after={<External color="var(--text-secondary)" />}
            {...props}
            ref={ref}
            asChild
          >
            <a target="_blank" href={href} rel="noreferrer">
              {children}
            </a>
          </Button>
        </MenuItem>
      )
    }

    return (
      <MenuItem asChild>
        <Button {...commonProps} {...props} ref={ref}>
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

export const Content: React.FC<MenuProps> = React.memo(function Content({
  children,
  ...props
}) {
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
})

export const ContextMenuTrigger = React.memo(function ContextMenuTrigger({
  children,
  enabled,
}: React.PropsWithChildren<{
  enabled?: boolean
}>) {
  if (!enabled) {
    return children
  }

  return <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
})

export const Root = ({
  dropdownMenuProps,
  contextMenuProps,
  openOnContextMenu = false,
  onOpenChange,
  children,
}: React.PropsWithChildren<{
  dropdownMenuProps?: DropdownMenu.DropdownMenuProps
  contextMenuProps?: ContextMenu.ContextMenuProps
  openOnContextMenu?: boolean
  onOpenChange?: (open: boolean) => void
}>) => {
  const [innerDropdownMenuOpen, setInnerDropdownMenuOpen] = useState(
    dropdownMenuProps?.defaultOpen
  )
  const dropdownMenuOpen = dropdownMenuProps?.open || innerDropdownMenuOpen
  const menuActions = useMemo(
    () => ({
      close: () => {
        onOpenChange?.(false)
        setInnerDropdownMenuOpen(false)
      },
    }),
    [onOpenChange]
  )
  const shouldShowDrawer = useMediaQuery(
    `(max-width:${SMALL_VIEWPORT_WIDTH}px)`
  )
  const shouldShowMenu = !shouldShowDrawer
  const shouldEnableContextMenu = openOnContextMenu && !shouldShowDrawer
  const isDrawerOpen = shouldShowDrawer && dropdownMenuOpen
  const isMenuOpen = shouldShowMenu && dropdownMenuOpen

  const handleOpenChange = useCallback(
    (newIsOpen: boolean) => {
      onOpenChange?.(newIsOpen)
      setInnerDropdownMenuOpen(newIsOpen)
    },
    [onOpenChange]
  )

  return (
    <MenuActionsProvider value={menuActions}>
      <Drawer.Root
        direction="bottom"
        open={isDrawerOpen}
        onOpenChange={handleOpenChange}
        disablePreventScroll
        repositionInputs
      >
        <DropdownMenu.Root
          {...dropdownMenuProps}
          open={isMenuOpen}
          onOpenChange={handleOpenChange}
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
