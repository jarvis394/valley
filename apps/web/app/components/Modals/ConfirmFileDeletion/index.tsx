import React, { Suspense, useState } from 'react'
import Button from '@valley/ui/Button'
import ModalHeader from '@valley/ui/ModalHeader'
import ModalFooter from '@valley/ui/ModalFooter'
import styles from './ConfirmFileDeletion.module.css'
import { useRemixForm } from 'remix-hook-form'
import Note from '@valley/ui/Note'
import { Await, Form, useParams } from '@remix-run/react'
import Stack from '@valley/ui/Stack'
import { useIsPending } from 'app/utils/misc'
import { FolderWithFiles } from '@valley/shared'
import { redirectToKey } from 'app/routes/auth+/verify+'
import ErrorModalContent from '../ErrorModalContent'
import { useFolderAwait } from 'app/utils/folder'

type ConfirmFileDeletionProps = {
  onClose: () => void
}

const ModalContent: React.FC<
  { folder?: FolderWithFiles | null } & ConfirmFileDeletionProps
> = ({ folder, onClose }) => {
  const searchParams = new URLSearchParams(window.location.search)
  const { folderId, projectId } = useParams()
  const [fileId] = useState(searchParams.get('modal-fileId'))
  const file = folder?.files.find((e) => e.id === fileId)
  const redirectTo = `/projects/${projectId}/folder/${folderId}`
  const formAction = `/api/files/${file?.id}/delete?${redirectToKey}=${redirectTo}`
  const { handleSubmit } = useRemixForm<FormData>({
    submitConfig: {
      navigate: true,
      viewTransition: true,
      action: formAction,
      method: 'POST',
    },
  })
  const isPending = useIsPending({
    formAction,
  })

  if (!file) {
    return (
      <ErrorModalContent onClose={onClose} title={'Delete File'}>
        File &quot;{fileId}&quot; was not found.
      </ErrorModalContent>
    )
  }

  return (
    <>
      <ModalHeader>Delete File</ModalHeader>
      <Form
        onSubmit={handleSubmit}
        id="confirm-folder-deletion-form"
        method="POST"
        action={formAction}
      >
        <Stack
          gap={4}
          padding={6}
          direction="column"
          className={styles.confirmFileDeletion__content}
        >
          <p>
            File <b>&quot;{file.name}&quot;</b> will be deleted.
          </p>
          <Note variant="warning" fill>
            You can restore this file from trash later
          </Note>
        </Stack>
      </Form>
      <ModalFooter
        className={styles.confirmFileDeletion__footer}
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
            form="confirm-folder-deletion-form"
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

const ConfirmFileDeletionModal: React.FC<ConfirmFileDeletionProps> = ({
  onClose,
}) => {
  const data = useFolderAwait()

  return (
    <Suspense>
      <Await resolve={data?.folder}>
        {(resolvedFolder) => (
          <ModalContent onClose={onClose} folder={resolvedFolder} />
        )}
      </Await>
    </Suspense>
  )
}

export default ConfirmFileDeletionModal