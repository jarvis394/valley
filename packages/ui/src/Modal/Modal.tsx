'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Modal as BaseModal, ModalOwnProps } from '@mui/base'
import styles from './Modal.module.css'
import Fade from '../Fade/Fade'
import Grow from '../Grow/Grow'

type ModalProps = React.PropsWithChildren<{
  id: string
  isOpen?: boolean
  onDismiss?: ModalOwnProps['onClose']
}>

const Modal: React.FC<ModalProps> = ({
  onDismiss,
  isOpen: propsIsOpen = false,
  children,
  id,
}) => {
  const [open, setOpen] = useState(propsIsOpen)
  const router = useRouter()
  const pathname = usePathname()
  const query = useSearchParams()
  const currentModal = useMemo(() => query.get('modal'), [query])

  const handleClose: ModalOwnProps['onClose'] = (
    event: React.MouseEvent | React.KeyboardEvent,
    reason
  ) => {
    // Use only user-provided function if it is present
    if (onDismiss) {
      return onDismiss(event, reason)
    }

    const newQuery = new URLSearchParams(query.toString())
    newQuery.delete('modal')

    router.push(pathname + '?' + newQuery.toString())
  }

  useEffect(() => {
    setOpen(currentModal === id)
  }, [currentModal, id])

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
  const { open, ownerState: _, ...other } = props
  return (
    <Fade
      {...other}
      ref={ref}
      in={open}
      transition={{ duration: 0.32, ease: 'easeInOut' }}
      className={styles.modal__dialogBackdrop}
    />
  )
})

export default Modal
