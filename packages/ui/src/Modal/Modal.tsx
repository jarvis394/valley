'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Modal as BaseModal } from '@mui/base/Modal'
import styles from './Modal.module.css'
import Grow from '../Grow/Grow'
import cx from 'classnames'
import useMediaQuery from '../useMediaQuery/useMediaQuery'
import { MIDDLE_VIEWPORT_WIDTH } from '../config/theme'
import { Drawer } from 'vaul'

type ModalProps = React.PropsWithChildren<{
  id: string
  isOpen?: boolean
  onDismiss?: () => void
}>

const Modal: React.FC<ModalProps> = ({
  onDismiss,
  isOpen: propsIsOpen = false,
  children,
  id,
}) => {
  const shouldShowDrawer = useMediaQuery(
    `(max-width:${MIDDLE_VIEWPORT_WIDTH}px)`
  )
  const [open, setOpen] = useState(propsIsOpen)
  const router = useRouter()
  const pathname = usePathname()
  const query = useSearchParams()
  const currentModal = useMemo(() => query.get('modal'), [query])

  const handleClose = () => {
    // Use only user-provided function if it is present
    if (onDismiss) {
      return onDismiss()
    }

    const newQuery = new URLSearchParams(query.toString())
    newQuery.delete('modal')

    router.push(pathname + '?' + newQuery.toString())
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
>((props, ref) => {
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
