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

    return <Button {...getRootProps(props)}>{children}</Button>
  }
)

export default React.memo(MenuButton)
