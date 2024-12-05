import React, { useState } from 'react'
import Button from '@valley/ui/Button'
import ModalHeader from '@valley/ui/ModalHeader'
import ModalFooter from '@valley/ui/ModalFooter'
import styles from './EditFolderTitle.module.css'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import TextField from '@valley/ui/TextField'
import {
  Form,
  useLocation,
  useParams,
  useRevalidator,
  useSearchParams,
} from '@remix-run/react'
import { FoldersEditSchema } from 'app/routes/api+/folders+/$id.edit'
import { SubmitHandler, useForm } from 'react-hook-form'
import { editFolder } from 'app/api/folders'

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
  const { register, getFieldState, formState, handleSubmit } =
    useForm<FormData>({ resolver })
  const [isPending, setPending] = useState(false)
  const revalidator = useRevalidator()

  const onSubmit: SubmitHandler<FormData> = async (data, e) => {
    e?.preventDefault()
    if (!folderId || !data.title) return

    setPending(true)
    await editFolder({
      folderId,
      title: data.title,
    })
    setPending(false)
    onClose()
    revalidator.revalidate()
  }

  return (
    <>
      <ModalHeader>Edit Folder Title</ModalHeader>
      <Form
        onSubmit={handleSubmit(onSubmit)}
        className={styles.editFolderTitle__form}
        id="edit-folder-title-form"
        method="POST"
        action={'/api/folders/' + folderId + '/edit'}
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
