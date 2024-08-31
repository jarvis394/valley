'use client'
import React, { useState } from 'react'
import Button from '@valley/ui/Button'
import Input from '@valley/ui/Input'
import InputLabel from '@valley/ui/InputLabel'
import ModalHeader from '@valley/ui/ModalHeader'
import ModalFooter from '@valley/ui/ModalFooter'
import styles from './EditFolderTitle.module.css'
import { SubmitHandler, useForm } from 'react-hook-form'
import { editFolder } from '../../../api/folders'
import { useParams, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { ProjectGetReq, ProjectGetRes } from '@valley/shared'
import { api } from '../../../api'

type EditFolderTitleModalProps = {
  onClose: () => void
}

type FieldValues = {
  folderTitle: string
}

const EditFolderTitleModal: React.FC<EditFolderTitleModalProps> = ({
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const { id: projectId } = useParams()
  const { data, mutate } = useSWR<ProjectGetRes, ProjectGetReq>(
    '/projects/' + projectId,
    api({ isAccessTokenRequired: true })
  )
  const searchParams = useSearchParams()
  const { register, handleSubmit } = useForm<FieldValues>()

  const onSubmit: SubmitHandler<FieldValues> = async (values, e) => {
    e?.preventDefault()
    const folderId = Number(searchParams.get('folder'))
    const parsedProjectId = Number(projectId)

    if (isNaN(parsedProjectId) || isNaN(folderId) || !data) return

    setIsLoading(true)
    const res = await editFolder(
      {
        title: values.folderTitle,
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
      <ModalHeader>Edit Folder Title</ModalHeader>
      <form
        id="edit-folder-title-form"
        className={styles.editFolderTitle__form}
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <InputLabel htmlFor="folder-title-input">Title</InputLabel>
          <Input
            {...register('folderTitle')}
            id="folder-title-input"
            placeholder="Folder"
          />
        </div>
      </form>
      <ModalFooter
        before={
          <Button onClick={onClose} variant="secondary-dimmed" size="md">
            Cancel
          </Button>
        }
        after={
          <Button
            form="edit-folder-title-form"
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

export default EditFolderTitleModal
