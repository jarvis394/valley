'use client'
import React from 'react'
import { useMenuButton } from '@mui/base'
import Button, { ButtonProps } from '../Button/Button'

type MenuButtonProps = ButtonProps & {
  focusableWhenDisabled?: boolean
}

const MenuButton = React.forwardRef<HTMLButtonElement, MenuButtonProps>(
  function MenuButton(
    { children, disabled = false, focusableWhenDisabled = false, ...props },
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
      onClick(e)
    }

    return (
      <Button {...rootProps} tabIndex={0} onClick={handleClick}>
        {children}
      </Button>
    )
  }
)

export default React.memo(MenuButton)
