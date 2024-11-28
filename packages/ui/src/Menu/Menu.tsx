import React from 'react'
import styles from './Menu.module.css'
import * as DropdownMenu from '../DropdownMenu/DropdownMenu'
import * as ContextMenu from '../ContextMenu/ContextMenu'

export type MenuProps = React.PropsWithChildren<
  {
    type?: 'dropdown' | 'context'
  } & DropdownMenu.DropdownMenuContentProps
>

export const MenuTypeContext = React.createContext<MenuProps['type']>(undefined)
export const MenuTypeProvider = MenuTypeContext.Provider
export const useMenuType = () => React.useContext(MenuTypeContext)

const Menu: React.FC<MenuProps> = ({ type, children, ...props }) => {
  const MenuType = type === 'dropdown' ? DropdownMenu : ContextMenu

  return (
    <MenuTypeProvider value={type}>
      <MenuType.Portal>
        <MenuType.Content
          onCloseAutoFocus={(e) => {
            e.preventDefault()
          }}
          align="start"
          data-type={type}
          className={styles.menu}
          {...props}
        >
          <div className={styles.menu__inner}>{children}</div>
        </MenuType.Content>
      </MenuType.Portal>
    </MenuTypeProvider>
  )
}

export default Menu
