'use client'
import React from 'react'
import styles from './Menu.module.css'
import { type WithOptionalOwnerState } from '@mui/base/utils/types'
import { MenuProvider, useMenu } from '@mui/base/useMenu'
import { MenuProps as MUIMenuProps, MenuListboxSlotProps } from '@mui/base/Menu'
import { CssTransition } from '@mui/base/Transitions'
import { PopupContext, PopupProps } from '@mui/base/Unstable_Popup'
import cx from 'classnames'
import { NoSsr } from '@mui/base/NoSsr'
import { Popup } from '@mui/base/Unstable_Popup/Popup'
import { ListActionTypes } from '@mui/base/useList'

type MenuProps = React.PropsWithChildren<MUIMenuProps & PopupProps>

const Menu = React.forwardRef<HTMLDivElement, MenuProps>(function Menu(
  {
    children,
    anchor: anchorProp,
    id,
    actions,
    onItemsChange,
    onClick,
    ...props
  },
  ref
) {
  const { contextValue, getListboxProps, dispatch, open, triggerElement } =
    useMenu({
      onItemsChange,
      componentName: 'Menu',
      id,
    })
  const anchor = anchorProp ?? triggerElement
  const stopPropagation = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation()
    onClick?.(e)
  }

  React.useImperativeHandle(
    actions,
    () => ({
      dispatch,
      resetHighlight: () =>
        dispatch({ type: ListActionTypes.resetHighlight, event: null }),
    }),
    [dispatch]
  )

  return (
    <NoSsr defer>
      <Popup
        {...props}
        keepMounted
        onClick={stopPropagation}
        open={open}
        anchor={anchor}
        ref={ref}
      >
        <AnimatedListbox {...getListboxProps()}>
          <MenuProvider value={contextValue}>{children}</MenuProvider>
        </AnimatedListbox>
      </Popup>
    </NoSsr>
  )
})

const AnimatedListbox = React.memo(
  React.forwardRef<
    HTMLUListElement,
    WithOptionalOwnerState<MenuListboxSlotProps>
  >(function AnimatedListbox(props, ref) {
    const { ownerState: _, className, ...other } = props
    const popupContext = React.useContext(PopupContext)
    if (popupContext === null) {
      console.error(
        'The `AnimatedListbox` component cannot be rendered outside a `Popup` component'
      )
      return null
    }

    return (
      <CssTransition
        className={styles[`menu__listbox--placement-${popupContext.placement}`]}
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
