import React, { useEffect, useMemo, useState } from 'react'
import type { SetURLSearchParams } from 'react-router-dom'
import { Modal as BaseModal } from '@mui/base'
import styles from './Modal.module.css'
import Grow from '../Grow/Grow'
import cx from 'classnames'
import useMediaQuery from '../useMediaQuery/useMediaQuery'
import { MIDDLE_VIEWPORT_WIDTH } from '../config/theme'
import { Drawer } from 'vaul'

const modalKey = 'modal'

type ModalProps = React.PropsWithChildren<{
  id: string
  isOpen?: boolean
  searchParams: URLSearchParams
  setSearchParams: SetURLSearchParams
  onDismiss?: () => void
}>

const Modal: React.FC<ModalProps> = ({
  isOpen: propsIsOpen = false,
  children,
  id,
  onDismiss,
  searchParams,
  setSearchParams,
}) => {
  const shouldShowDrawer = useMediaQuery(
    `(max-width:${MIDDLE_VIEWPORT_WIDTH}px)`
  )
  const [open, setOpen] = useState(propsIsOpen)
  const currentModal = useMemo(
    () => searchParams?.get(modalKey),
    [searchParams]
  )

  const handleClose = () => {
    // Use only user-provided function if it is present
    if (onDismiss) {
      return onDismiss()
    }

    setSearchParams((prev) => {
      prev.delete(modalKey)
      return prev
    })
  }

  useEffect(() => {
    setOpen(currentModal === id)
  }, [currentModal, id])

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
          <Drawer.Overlay className={styles.modal__drawerOverlay} />
        </Drawer.Portal>
      </Drawer.Root>
    )
  }

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
      className={styles.modal}
      closeAfterTransition
      slots={{
        backdrop: Backdrop,
      }}
    >
      <Grow
        in={open}
        transformTemplate={(e) => `translate(-50%, -50%) scale(${e.scale})`}
        transition={{ duration: 0.32, ease: 'circInOut' }}
        className={styles.modal__dialog}
      >
        {children}
      </Grow>
    </BaseModal>
  )
}

const Backdrop = React.forwardRef<
  HTMLDivElement,
  { children: React.ReactElement; open: boolean; ownerState: never }
>(function Backdrop(props, ref) {
  const { open: propsIsOpen, ownerState: _, ...other } = props
  const [open, setOpen] = useState(false)

  // To make fade animation work, first value in DOM for `data-fade-in` should be `false`
  // After initial render, we can catch up to the latest props `open` value
  useEffect(() => {
    setOpen(propsIsOpen)
  }, [propsIsOpen])

  return (
    <div
      {...other}
      ref={ref}
      data-fade-in={open}
      className={cx(styles.modal__dialogBackdrop, 'fade')}
    />
  )
})

export default Modal
