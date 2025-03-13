import React, { useState } from 'react'
import Button from '@valley/ui/Button'
import ModalHeader from '@valley/ui/ModalHeader'
import ModalFooter from '@valley/ui/ModalFooter'
import ModalContent from '@valley/ui/ModalContent'
import styles from './ConfirmConnectionDelete.module.css'
import { PROVIDER_LABELS } from 'app/config/connections'
import type { AccountData } from 'app/routes/_user+/_home+/settings+/auth'
import { authClient } from '@valley/auth/client'
import { showToast } from '@valley/ui/Toast'
import { useRevalidator } from '@remix-run/react'

type ConfirmConnectionDeleteProps = {
  onClose: () => void
  data: AccountData
}

const passwordModalContent = (
  <p>
    You are about to remove your password.
    <br />
    <br />
    After removing it, you will still be able to log into your account with{' '}
    <span className={styles.confirmConnectionDelete__label}>magic links</span>
    .
    <br />
    <br />
    Do you want to continue?
  </p>
)

const socialProviderModalContent = (label: string) => (
  <p>
    You are about to remove the login connection for{' '}
    <span className={styles.confirmConnectionDelete__label}>{label}</span>
    .
    <br />
    <br />
    After removing it, you won&apos;t be able to use{' '}
    <span className={styles.confirmConnectionDelete__label}>{label}</span> to
    log into your account anymore.
    <br />
    <br />
    Do you want to continue?
  </p>
)

const ConfirmConnectionDeleteModal: React.FC<ConfirmConnectionDeleteProps> = ({
  onClose,
  data,
}) => {
  const label = PROVIDER_LABELS[data.provider]
  const [isPending, setPending] = useState(false)
  const revalidator = useRevalidator()

  const handleClick = async () => {
    setPending(true)
    await authClient.unlinkAccount({
      providerId: data.provider,
      fetchOptions: {
        onSuccess() {
          showToast({
            type: 'default',
            title: label,
            description:
              data.provider === 'credential'
                ? 'Your password has been removed.'
                : 'Your connection has been deleted.',
            id: 'connection-deleted',
          })
          onClose()
          revalidator.revalidate()
        },
        onError() {
          setPending(false)
        },
      },
    })
  }

  return (
    <>
      <ModalHeader>Disconnect {label}</ModalHeader>
      <ModalContent className={styles.confirmConnectionDelete__content}>
        {data.provider === 'credential' && passwordModalContent}
        {data.provider !== 'credential' && socialProviderModalContent(label)}
      </ModalContent>
      <ModalFooter
        before={
          <Button
            tabIndex={0}
            onClick={onClose}
            variant="secondary-dimmed"
            size="md"
            disabled={isPending}
          >
            Cancel
          </Button>
        }
        after={
          <Button
            variant="danger"
            size="md"
            type="submit"
            onClick={handleClick}
            disabled={isPending}
            loading={isPending}
          >
            {data.provider === 'credential' ? 'Remove' : 'Delete'}
          </Button>
        }
      />
    </>
  )
}

export default ConfirmConnectionDeleteModal
