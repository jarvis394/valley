'use client'
import React from 'react'
import { useMenuButton } from '@mui/base/useMenuButton'
import IconButton, { IconProps } from '../IconButton/IconButton'

type MenuIconButtonProps = IconProps & {
  focusableWhenDisabled?: boolean
}

const MenuIconButton = React.forwardRef<HTMLButtonElement, MenuIconButtonProps>(
  function MenuIconButton(
    {
      children,
      disabled = false,
      onClick: propsOnClick,
      focusableWhenDisabled = false,
      ...props
    },
    ref
  ) {
    const { getRootProps } = useMenuButton({
      disabled,
      focusableWhenDisabled,
      rootRef: ref,
    })
    const { onClick, ...rootProps } = getRootProps(props)
    const handleClick = (
      e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
      e.stopPropagation()
      propsOnClick?.(e)
      onClick(e)
    }

    return (
      <IconButton {...rootProps} onClick={handleClick}>
        {children}
      </IconButton>
    )
  }
)

export default MenuIconButton
