import React from 'react'
import styles from './Menu.module.css'
import {
  type WithOptionalOwnerState,
  MenuProvider,
  useMenu,
  MenuProps as MUIMenuProps,
  MenuListboxSlotProps,
  CssTransition,
  PopupContext,
  PopupProps,
  NoSsr,
} from '@mui/base'
import cx from 'classnames'
import { Popup } from './Popup'

export const ListActionTypes = {
  blur: 'list:blur',
  focus: 'list:focus',
  itemClick: 'list:itemClick',
  itemHover: 'list:itemHover',
  itemsChange: 'list:itemsChange',
  keyDown: 'list:keyDown',
  resetHighlight: 'list:resetHighlight',
  highlightLast: 'list:highlightLast',
  textNavigation: 'list:textNavigation',
  clearSelection: 'list:clearSelection',
} as const

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
