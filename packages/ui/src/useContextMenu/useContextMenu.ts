import { DropdownProps } from '@mui/base/Dropdown'
import React, { useState } from 'react'

export type Anchor = {
  getBoundingClientRect(): {
    x: number
    y: number
    top: number
    left: number
    bottom: number
    right: number
    width: number
    height: number
  }
}

export type UseContextMenu = {
  dropdownProps: Partial<DropdownProps>
  onMenuButtonClick: React.MouseEventHandler
  onContextMenu: React.MouseEventHandler
  anchor?: Anchor
}

export const useContextMenu = (): UseContextMenu => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const [anchor, setAnchor] = useState<Anchor | undefined>()

  const handleDropdownIsOpenChange = (
    _e:
      | React.MouseEvent<Element, MouseEvent>
      | React.KeyboardEvent<Element>
      | React.FocusEvent<Element, Element>
      | null,
    open: boolean
  ) => {
    setIsMenuOpen(open)
  }

  const handleMenuButtonClick = () => {
    !isMenuOpen && setAnchor(undefined)
  }

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault()
    setAnchor({
      getBoundingClientRect() {
        return {
          x: 0,
          y: 0,
          top: event.clientY,
          left: event.clientX,
          bottom: 0,
          right: 0,
          width: 1,
          height: 1,
        }
      },
    })
    setIsMenuOpen(true)
  }

  return {
    dropdownProps: {
      open: isMenuOpen,
      onOpenChange: handleDropdownIsOpenChange,
    },
    onMenuButtonClick: handleMenuButtonClick,
    onContextMenu: handleContextMenu,
    anchor,
  }
}
