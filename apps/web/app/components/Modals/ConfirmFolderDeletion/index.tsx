import React, { useState } from 'react'
import Button from '@valley/ui/Button'
import ModalHeader from '@valley/ui/ModalHeader'
import ModalFooter from '@valley/ui/ModalFooter'
import styles from './ConfirmFolderDeletion.module.css'
import { useRemixForm } from 'remix-hook-form'
import TextField from '@valley/ui/TextField'
import Note from '@valley/ui/Note'
import { Form, useParams } from 'react-router'
import Stack from '@valley/ui/Stack'
import { useIsPending } from 'app/utils/misc'
import { useProject } from 'app/utils/project'
import { ProjectWithFolders } from '@valley/shared'
import { redirectToKey } from 'app/config/paramsKeys'
import ErrorModalContent from '../ErrorModalContent'
import ModalContent from '@valley/ui/ModalContent'
import escape from 'regexp.escape'

type ConfirmFolderDeletionProps = { onClose: () => void }

const ModalContents: React.FC<
  { project?: ProjectWithFolders | null } & ConfirmFolderDeletionProps
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
  const formAction = `/api/projects/${projectId}/folders/${folder?.id}/delete?${redirectToKey}=${redirectTo}`
  const { handleSubmit } = useRemixForm<FormData>({
    submitConfig: { navigate: true, action: formAction, method: 'POST' },
  })
  const isFolderWithFiles = folder?.totalFiles !== 0
  const isPending = useIsPending({ formAction })
  const folderTitlePattern = `\\s*${escape(folder?.title || '')}\\s*`
  const deleteConfirmPattern = '\\s*delete my folder\\s*'

  if (!folder) {
    return (
      <ErrorModalContent onClose={onClose} title={'Delete Folder'}>
        Folder &quot;{folderId}&quot; was not found.
      </ErrorModalContent>
    )
  }

  if (folder.isDefaultFolder) {
    return (
      <ErrorModalContent onClose={onClose} title={'Delete Folder'}>
        Cannot delete folder &quot;{folderId}&quot; as it is a default folder.
      </ErrorModalContent>
    )
  }

  return (
    <>
      <ModalHeader>Delete Folder</ModalHeader>
      <Form
        onSubmit={handleSubmit}
        id="confirm-folder-deletion-form"
        method="POST"
        action={formAction}
      >
        <ModalContent>
          <p>
            Folder <b>&quot;{folder?.title}&quot;</b>
            {isFolderWithFiles && (
              <>
                , alongside with <b>{folder?.totalFiles} files</b>,
              </>
            )}
            &nbsp;will be deleted.
          </p>
          <Note variant="alert" fill>
            This action is not reversible. Please be certain.
          </Note>
        </ModalContent>
        {isFolderWithFiles && (
          <Stack
            direction={'column'}
            gap={6}
            padding={6}
            className={styles.confirmFolderDeletion__form}
          >
            <label htmlFor="folder-title-input">
              <Stack gap={2} direction="column">
                <p className={styles.confirmFolderDeletion__formLabel}>
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
                <p className={styles.confirmFolderDeletion__formLabel}>
                  To verify, type <b>delete my folder</b> below:
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
        className={styles.confirmFolderDeletion__footer}
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
            {isFolderWithFiles ? 'Continue' : 'Delete'}
          </Button>
        }
      />
    </>
  )
}

const ConfirmFolderDeletionModal: React.FC<ConfirmFolderDeletionProps> = ({
  onClose,
}) => {
  const project = useProject()

  return <ModalContents onClose={onClose} project={project} />
}

export default ConfirmFolderDeletionModal
