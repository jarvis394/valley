import React, { useEffect, useMemo, useState } from 'react'
import type { SetURLSearchParams } from 'react-router-dom'
import styles from './Modal.module.css'
import useMediaQuery from '../useMediaQuery/useMediaQuery'
import { SMALL_VIEWPORT_WIDTH } from '../config/theme'
import { Drawer } from 'vaul'
import * as Dialog from '@radix-ui/react-dialog'

export const modalKey = 'modal'

export type ModalProps = React.PropsWithChildren<{
  id: string
  isOpen?: boolean
  searchParams: URLSearchParams
  setSearchParams: SetURLSearchParams
  onDismiss?: () => void
}>

const Modal: React.FC<ModalProps> = ({
  isOpen: propsIsOpen,
  children,
  id,
  onDismiss,
  searchParams,
  setSearchParams,
}) => {
  const shouldShowDrawer = useMediaQuery(
    `(max-width:${SMALL_VIEWPORT_WIDTH}px)`
  )
  const [open, setOpen] = useState(propsIsOpen || false)
  const currentModal = useMemo(
    () => searchParams?.get(modalKey),
    [searchParams]
  )

  const handleClose = () => {
    // Use only user-provided function if it is present
    if (onDismiss) {
      return onDismiss()
    }

    // TODO: navigate back and handle empty history
    setSearchParams((prev) => {
      prev.delete(modalKey)
      return prev
    })
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
        open={open}
        onOpenChange={handleDrawerOpenChange}
        disablePreventScroll
        repositionInputs
      >
        <Drawer.Portal>
          <Drawer.Content className={styles.modal__drawer}>
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
    <Dialog.Root open={open} onOpenChange={handleDrawerOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.modal__dialogOverlay} />
        <Dialog.Content className={styles.modal__dialog}>
          <Drawer.Description style={{ display: 'none' }}>
            {currentModal}
          </Drawer.Description>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default Modal

export * from '@radix-ui/react-dialog'
