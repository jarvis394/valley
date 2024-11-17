import React from 'react'
import { useMenuButton } from '@mui/base'
import Button, { ButtonProps } from '../Button/Button'
import { Slot } from '@radix-ui/react-slot'

type MenuButtonProps = ButtonProps & {
  focusableWhenDisabled?: boolean
}

const MenuButton = React.forwardRef<HTMLButtonElement, MenuButtonProps>(
  function MenuButton(
    {
      children,
      asChild,
      disabled = false,
      focusableWhenDisabled = false,
      ...props
    },
    ref
  ) {
    const Root = asChild ? Slot : Button
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
      <Root {...rootProps} tabIndex={0} onClick={handleClick}>
        {children}
      </Root>
    )
  }
)

export default MenuButton
