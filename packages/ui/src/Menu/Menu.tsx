'use client'
import React from 'react'
import styles from './Menu.module.css'
import { WithOptionalOwnerState } from '@mui/base'
import {
  Menu as MUIMenu,
  MenuProps as MUIMenuProps,
  MenuListboxSlotProps,
} from '@mui/base/Menu'
import { CssTransition } from '@mui/base/Transitions'
import { PopupContext } from '@mui/base/Unstable_Popup'
import cx from 'classnames'

type MenuProps = React.PropsWithChildren<MUIMenuProps>

const Menu = React.forwardRef<HTMLDivElement, MenuProps>(function Menu(
  { children, slots, ...props },
  ref
) {
  return (
    <MUIMenu
      {...props}
      ref={ref}
      slots={{ ...slots, listbox: AnimatedListbox }}
    >
      {children}
    </MUIMenu>
  )
})

const AnimatedListbox = React.memo(
  React.forwardRef<
    HTMLUListElement,
    WithOptionalOwnerState<MenuListboxSlotProps>
  >(function AnimatedListbox(props, ref) {
    const { ownerState: _, className, ...other } = props
    const popupContext = React.useContext(PopupContext)
    if (popupContext == null) {
      throw new Error(
        'The `AnimatedListbox` component cannot be rendered outside a `Popup` component'
      )
    }

    const verticalPlacement = popupContext.placement.split('-')[0] as
      | 'bottom'
      | 'top'

    return (
      <CssTransition
        className={styles[`menu__listbox--placement-${verticalPlacement}`]}
        enterClassName={styles['menu__listbox--open']}
        exitClassName={styles['menu__listbox--closed']}
      >
        <ul
          {...other}
          className={cx(styles.menu__listbox, className)}
          ref={ref}
        />
      </CssTransition>
    )
  })
)

export default React.memo(Menu)
