import React from 'react'
import Button from '@valley/ui/Button'
import ModalHeader from '@valley/ui/ModalHeader'
import ModalFooter from '@valley/ui/ModalFooter'
import ModalContent from '@valley/ui/ModalContent'
import styles from './ConfirmConnectionDelete.module.css'
import { Form } from '@remix-run/react'
import { useIsPending } from 'app/utils/misc'
import { PROVIDER_LABELS } from 'app/config/connections'
import { ConnectionData } from 'app/routes/_user+/_home+/settings+/auth'

type ConfirmConnectionDeleteProps = {
  onClose: () => void
  data: ConnectionData
}

const ConfirmConnectionDeleteModal: React.FC<ConfirmConnectionDeleteProps> = ({
  onClose,
  data,
}) => {
  const formAction = '/settings/auth'
  const isPending = useIsPending({ formAction, formMethod: 'POST' })
  const label = PROVIDER_LABELS[data.providerName]

  return (
    <>
      <ModalHeader>Disconnect {label}</ModalHeader>
      <ModalContent asChild>
        <Form
          className={styles.confirmConnectionDelete__form}
          action={formAction}
          id="confirm-connection-delete-form"
          method="POST"
        >
          <p>
            You are about to remove the login connection for{' '}
            <span className={styles.confirmConnectionDelete__label}>
              {label}
            </span>
            .
            <br />
            <br />
            After removing it, you won&apos;t be able to use{' '}
            <span className={styles.confirmConnectionDelete__label}>
              {label}
            </span>{' '}
            to log into your account anymore.
            <br />
            <br />
            Do you want to continue?
          </p>
          <input name="intent" value="delete-connection" type="hidden" />
          <input name="connectionId" value={data.id} type="hidden" />
        </Form>
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
            form="confirm-connection-delete-form"
            variant="primary"
            size="md"
            type="submit"
            disabled={isPending}
            loading={isPending}
          >
            Delete
          </Button>
        }
      />
    </>
  )
}

export default ConfirmConnectionDeleteModal
