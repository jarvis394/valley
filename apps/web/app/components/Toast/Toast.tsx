import React, { useEffect } from 'react'
import { toast as toaster, Toaster as Sonner } from 'sonner'
import { type Toast } from '../../server/toast.server'
import styles from './Toast.module.css'
import IconButton from '@valley/ui/IconButton'
import { Cross } from 'geist-ui-icons'
import Stack from '@valley/ui/Stack'
import cx from 'classnames'

export const ToastElement: React.FC<{ toast: Toast }> = ({ toast }) => {
  const handleClose = () => {
    toaster.dismiss(toast.id)
  }

  return (
    <Stack
      gap={2}
      padding={4}
      justify={'space-between'}
      align={'center'}
      className={cx(styles.toast, {
        [styles['toast--info']]: toast.type === 'info',
        [styles['toast--success']]: toast.type === 'success',
        [styles['toast--warning']]: toast.type === 'warning',
        [styles['toast--error']]: toast.type === 'error',
      })}
    >
      <Stack direction={'column'} gap={1} className={styles.toast__content}>
        {toast.title && <h1>{toast.title}</h1>}
        {toast.description && <p>{toast.description}</p>}
      </Stack>
      <IconButton
        className={styles.toast__closeButton}
        onClick={handleClose}
        variant="tertiary-dimmed"
      >
        <Cross />
      </IconButton>
    </Stack>
  )
}

export const showToast = (toast: Toast) => {
  setTimeout(() => {
    toaster.custom((id) => <ToastElement toast={{ ...toast, id }} />)
  }, 0)
}

export const useToast = (toast?: Toast | null) => {
  useEffect(() => {
    if (toast) {
      showToast(toast)
    }
  }, [toast])
}

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster: React.FC<ToasterProps> = ({ theme, ...props }) => {
  return (
    <Sonner
      theme={theme}
      richColors
      position="bottom-right"
      closeButton
      {...props}
    />
  )
}

export default Toaster
