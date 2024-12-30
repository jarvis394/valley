import React, { useEffect, useState } from 'react'
import styles from './Modal.module.css'
import useMediaQuery from '../useMediaQuery/useMediaQuery'
import { SMALL_VIEWPORT_WIDTH } from '../config/theme'
import { Drawer, DialogProps } from 'vaul'
import * as Dialog from '@radix-ui/react-dialog'

export const modalKey = 'modal'

export type ModalProps = React.PropsWithChildren<{
  id: string
  isOpen?: boolean
  onDismiss?: () => void
}> &
  DialogProps

const Modal: React.FC<ModalProps> = ({
  isOpen: propsIsOpen,
  children,
  id,
  onDismiss,
  ...props
}) => {
  const shouldShowDrawer = useMediaQuery(
    `(max-width:${SMALL_VIEWPORT_WIDTH}px)`
  )
  const [open, setOpen] = useState(propsIsOpen || false)
  const currentModal = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : ''
  )?.get(modalKey)

  const handleClose = () => {
    // Use only user-provided function if it is present
    if (onDismiss) {
      return onDismiss()
    }

    setOpen(false)
  }

  useEffect(() => {
    if (propsIsOpen === undefined) return
    setOpen(propsIsOpen)
  }, [propsIsOpen])

  useEffect(() => {
    if (propsIsOpen !== undefined) return
    setOpen(currentModal === id)
  }, [currentModal, id, propsIsOpen])

  const handleDrawerOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      return handleClose()
    }
  }

  if (shouldShowDrawer) {
    return (
      <Drawer.Root
        direction="bottom"
        disablePreventScroll
        repositionInputs
        handleOnly
        {...props}
        open={open}
        onOpenChange={handleDrawerOpenChange}
      >
        <Drawer.Portal>
          <Drawer.Content className={styles.modal__drawer}>
            <Drawer.Handle className={styles.modal__drawerHandle} />
            <Drawer.Title style={{ display: 'none' }}>
              {currentModal}
            </Drawer.Title>
            <Drawer.Description style={{ display: 'none' }}>
              {currentModal}
            </Drawer.Description>
            {children}
          </Drawer.Content>
          <Drawer.Overlay className={styles.modal__dialogOverlay} />
        </Drawer.Portal>
      </Drawer.Root>
    )
  }

  return (
    <Dialog.Root {...props} open={open} onOpenChange={handleDrawerOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.modal__dialogOverlay} />
        <Dialog.Content className={styles.modal__dialog}>
          <Dialog.Title style={{ display: 'none' }}>
            {currentModal}
          </Dialog.Title>
          <Dialog.Description style={{ display: 'none' }}>
            {currentModal}
          </Dialog.Description>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default Modal

export * from '@radix-ui/react-dialog'
export * as Drawer from 'vaul'
