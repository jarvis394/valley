'use client'
import React from 'react'
import { useMenuButton } from '@mui/base'
import IconButton from '../IconButton/IconButton'
import { ButtonProps } from '../Button/Button'

type MenuIconButtonProps = ButtonProps & {
  focusableWhenDisabled?: boolean
}

const MenuIconButton = React.forwardRef<HTMLButtonElement, MenuIconButtonProps>(
  function MenuIconButton(
    { children, disabled = false, focusableWhenDisabled = false, ...props },
    ref
  ) {
    const { getRootProps } = useMenuButton({
      disabled,
      focusableWhenDisabled,
      rootRef: ref,
    })

    return <IconButton {...getRootProps(props)}>{children}</IconButton>
  }
)

export default React.memo(MenuIconButton)
