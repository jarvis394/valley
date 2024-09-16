'use client'
import React, { useState } from 'react'
import Button from '@valley/ui/Button'
import TextArea from '@valley/ui/TextArea'
import InputLabel from '@valley/ui/InputLabel'
import ModalHeader from '@valley/ui/ModalHeader'
import ModalFooter from '@valley/ui/ModalFooter'
import styles from './EditFolderDescription.module.css'
import { SubmitHandler, useForm } from 'react-hook-form'
import { editFolder } from '../../../api/folders'
import { useParams, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { ProjectGetReq, ProjectGetRes } from '@valley/shared'
import { api } from '../../../api'

type EditFolderDescriptionModalProps = {
  onClose: () => void
}

type FieldValues = {
  folderDescription: string
}

const EditFolderDescriptionModal: React.FC<EditFolderDescriptionModalProps> = ({
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const { id: projectId } = useParams()
  const { data, mutate } = useSWR<ProjectGetRes, ProjectGetReq>(
    '/projects/' + projectId,
    api({ isAccessTokenRequired: true })
  )
  const searchParams = useSearchParams()
  const modalPropsFolderId = searchParams.get('modal-folderId')
  const searchParamsFolderId = searchParams.get('folder')
  const folderId = Number(modalPropsFolderId || searchParamsFolderId)
  const parsedProjectId = Number(projectId)
  const defaultDescription =
    data?.folders.find((e) => e.id === folderId)?.description || ''
  const { register, handleSubmit } = useForm<FieldValues>()

  const onSubmit: SubmitHandler<FieldValues> = async (values, e) => {
    e?.preventDefault()
    if (isNaN(parsedProjectId) || isNaN(folderId) || !data) return

    setIsLoading(true)
    const res = await editFolder(
      {
        description: values.folderDescription,
        id: folderId,
      },
      parsedProjectId
    )

    onClose()
    await mutate({
      ...data,
      folders: data.folders.map((e) =>
        e.id === res.folder.id ? res.folder : e
      ),
    })
  }

  return (
    <>
      <ModalHeader>Edit Folder Description</ModalHeader>
      <form
        id="edit-folder-description-form"
        className={styles.editFolderDescription__form}
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <InputLabel htmlFor="folder-description-input">
            Description
          </InputLabel>
          <TextArea
            {...register('folderDescription')}
            defaultValue={defaultDescription}
            id="folder-description-input"
            placeholder="Write here anything..."
          />
        </div>
      </form>
      <ModalFooter
        before={
          <Button
            onClick={onClose}
            disabled={isLoading}
            variant="secondary-dimmed"
            size="md"
          >
            Cancel
          </Button>
        }
        after={
          <Button
            form="edit-folder-description-form"
            variant="primary"
            size="md"
            disabled={isLoading}
            loading={isLoading}
          >
            Save
          </Button>
        }
      />
    </>
  )
}

export default EditFolderDescriptionModal
