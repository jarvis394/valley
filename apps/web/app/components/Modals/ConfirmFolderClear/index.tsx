import React, { Suspense, useState } from 'react'
import Button from '@valley/ui/Button'
import ModalHeader from '@valley/ui/ModalHeader'
import ModalFooter from '@valley/ui/ModalFooter'
import styles from './ConfirmFolderClear.module.css'
import { useRemixForm } from 'remix-hook-form'
import TextField from '@valley/ui/TextField'
import Note from '@valley/ui/Note'
import { Await, Form, useParams } from '@remix-run/react'
import Stack from '@valley/ui/Stack'
import { useIsPending } from 'app/utils/misc'
import { useProjectAwait } from 'app/utils/project'
import { ProjectWithFolders } from '@valley/shared'
import { redirectToKey } from 'app/routes/auth+/verify+'
import ErrorModalContent from '../ErrorModalContent'
import Spinner from '@valley/ui/Spinner'

type ConfirmFolderClearProps = {
  onClose: () => void
}

const ModalContent: React.FC<
  { project?: ProjectWithFolders | null } & ConfirmFolderClearProps
> = ({ project, onClose }) => {
  const searchParams = new URLSearchParams(window.location.search)
  const { folderId: paramsFolderId, projectId } = useParams()
  const [folderId] = useState(searchParams.get('modal-folderId'))
  const defaultFolder = project?.folders.find((e) => e.isDefaultFolder)
  const folder = project?.folders.find((e) => e.id === folderId)
  const redirectToFolderId =
    paramsFolderId === folderId ? defaultFolder?.id : paramsFolderId
  const redirectTo = `/projects/${projectId}${
    redirectToFolderId ? `/folder/${redirectToFolderId}` : ''
  }`
  const formAction = `/api/folders/${folder?.id}/clear?${redirectToKey}=${redirectTo}`
  const { handleSubmit } = useRemixForm<FormData>({
    submitConfig: {
      navigate: true,
      action: formAction,
      method: 'POST',
    },
  })
  const isFolderWithFiles = folder?.totalFiles !== 0
  const isPending = useIsPending({
    formAction,
  })
  const folderTitlePattern = `\\s*${folder?.title}\\s*`
  const deleteConfirmPattern = '\\s*delete my files\\s*'

  if (!folder) {
    return (
      <ErrorModalContent onClose={onClose} title={'Clear Folder'}>
        Folder &quot;{folderId}&quot; was not found.
      </ErrorModalContent>
    )
  }

  return (
    <>
      <ModalHeader>Clear Folder</ModalHeader>
      <Form
        onSubmit={handleSubmit}
        id="confirm-folder-clear-form"
        method="POST"
        action={formAction}
      >
        <Stack
          gap={4}
          padding={6}
          direction="column"
          className={styles.confirmFolderClear__content}
        >
          <p>
            All folder <b>&quot;{folder?.title}&quot;</b> files will be deleted,
            which is <b>{folder?.totalFiles} files</b> total.
          </p>
          <Note variant="alert" fill>
            This action is not reversible. Please be certain.
          </Note>
        </Stack>
        {isFolderWithFiles && (
          <Stack
            direction={'column'}
            gap={6}
            padding={6}
            className={styles.confirmFolderClear__form}
          >
            <label htmlFor="folder-title-input">
              <Stack gap={2} direction="column">
                <p className={styles.confirmFolderClear__formLabel}>
                  Enter the folder title <b>{folder?.title}</b> to continue:
                </p>
                <TextField
                  required
                  pattern={folderTitlePattern}
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  type="text"
                  id="folder-title-input"
                />
              </Stack>
            </label>
            <label htmlFor="delete-confirm-input">
              <Stack gap={2} direction="column">
                <p className={styles.confirmFolderClear__formLabel}>
                  To verify, type <b>delete my files</b> below:
                </p>
                <TextField
                  required
                  pattern={deleteConfirmPattern}
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  type="text"
                  id="delete-confirm-input"
                />
              </Stack>
            </label>
          </Stack>
        )}
      </Form>
      <ModalFooter
        className={styles.confirmFolderClear__footer}
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
            form="confirm-folder-clear-form"
            variant="primary"
            size="md"
            type="submit"
            disabled={isPending}
            loading={isPending}
          >
            {isFolderWithFiles ? 'Continue' : 'Delete'}
          </Button>
        }
      />
    </>
  )
}

const ConfirmFolderClearModal: React.FC<ConfirmFolderClearProps> = ({
  onClose,
}) => {
  const data = useProjectAwait()

  return (
    <Suspense
      fallback={
        <>
          <ModalHeader>Clear Folder</ModalHeader>
          <Stack padding={[4, 4, 8, 4]} align={'center'} justify={'center'}>
            <Spinner />
          </Stack>
        </>
      }
    >
      <Await resolve={data?.project}>
        {(resolvedProject) => (
          <ModalContent onClose={onClose} project={resolvedProject} />
        )}
      </Await>
    </Suspense>
  )
}

export default ConfirmFolderClearModal
