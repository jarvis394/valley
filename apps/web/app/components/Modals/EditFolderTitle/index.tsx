import React from 'react'
import Button from '@valley/ui/Button'
import ModalHeader from '@valley/ui/ModalHeader'
import ModalFooter from '@valley/ui/ModalFooter'
import styles from './EditFolderTitle.module.css'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import TextField from '@valley/ui/TextField'
import { Form, useLocation, useParams, useSearchParams } from '@remix-run/react'
import { FoldersEditSchema } from 'app/routes/api+/folders+/$id.edit'
import { useRemixForm } from 'remix-hook-form'
import { useIsPending } from 'app/utils/misc'

type FormData = z.infer<typeof FoldersEditSchema>

const resolver = zodResolver(FoldersEditSchema)

type EditFolderTitleModalProps = {
  onClose: () => void
}

const EditFolderTitleModal: React.FC<EditFolderTitleModalProps> = ({
  onClose,
}) => {
  const location = useLocation()
  const { folderId: paramsFolderId } = useParams()
  const [searchParams] = useSearchParams()
  const modalPropsFolderId = searchParams.get('modal-folderId')
  const defaultTitle = location.state?.defaultTitle
  const folderId = modalPropsFolderId || paramsFolderId
  const formAction = '/api/folders/' + folderId + '/edit'
  const { register, getFieldState, formState, handleSubmit } =
    useRemixForm<FormData>({
      resolver,
      submitConfig: {
        action: formAction,
        method: 'POST',
      },
    })
  const isPending = useIsPending({
    formMethod: 'POST',
    formAction,
  })

  return (
    <>
      <ModalHeader>Edit Folder Title</ModalHeader>
      <Form
        onSubmit={handleSubmit}
        id="edit-folder-title-form"
        className={styles.editFolderTitle__form}
      >
        <div>
          <TextField
            {...register('title', {
              required: true,
            })}
            fieldState={getFieldState('title', formState)}
            label="Title"
            required
            size="lg"
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            defaultValue={defaultTitle}
            id="folder-title-input"
            placeholder="Folder"
          />
        </div>
      </Form>
      <ModalFooter
        before={
          <Button
            onClick={onClose}
            disabled={isPending}
            variant="secondary-dimmed"
            size="md"
          >
            Cancel
          </Button>
        }
        after={
          <Button
            form="edit-folder-title-form"
            variant="primary"
            size="md"
            type="submit"
            disabled={isPending}
            loading={isPending}
          >
            Save
          </Button>
        }
      />
    </>
  )
}

export default EditFolderTitleModal
