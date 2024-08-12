'use client'
import React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { DialogContent, DialogOverlay, DialogProps } from '@reach/dialog'
import { animated, useTransition, easings } from '@react-spring/web'
import styles from './Modal.module.css'

type ModalProps = DialogProps

const Modal: React.FC<ModalProps> = ({
  onDismiss,
  isOpen,
  children,
  ...props
}) => {
  const AnimatedDialogOverlay = animated(DialogOverlay)
  const AnimatedDialogContent = animated(DialogContent)
  const router = useRouter()
  const pathname = usePathname()
  const query = useSearchParams()
  const transitions = useTransition(isOpen, {
    from: { opacity: 0, scale: 0.95 },
    enter: { opacity: 1, scale: 1 },
    leave: { opacity: 0, scale: 0.95 },
    config: {
      duration: 680,
      easing: easings.easeOutExpo,
    },
  })

  const handleClose = (event: React.MouseEvent | React.KeyboardEvent) => {
    // Use only user-provided function if it is present
    // See `handleClose` definition in lib/features/modals/index.tsxs
    if (onDismiss) {
      return onDismiss(event)
    }

    const newQuery = new URLSearchParams(query.toString())
    newQuery.delete('modal')

    router.push(pathname + '?' + newQuery.toString())
  }

  return transitions(
    (animationStyles, item) =>
      item && (
        <AnimatedDialogOverlay
          isOpen={isOpen}
          className={styles.modal__dialogBackdrop}
          onDismiss={handleClose}
          style={{ opacity: animationStyles.opacity }}
        >
          <AnimatedDialogContent
            {...props}
            style={{
              transform: animationStyles.scale.to((value) => `scale(${value})`),
            }}
            className={styles.modal__dialogContent}
          >
            {children}
          </AnimatedDialogContent>
        </AnimatedDialogOverlay>
      )
  )
}

export default Modal
