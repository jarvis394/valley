'use client'
import React, { useEffect, useState } from 'react'
import Button from '@valley/ui/Button'
import Input from '@valley/ui/Input'
import ModalHeader from '@valley/ui/ModalHeader'
import ModalFooter from '@valley/ui/ModalFooter'
import Note from '@valley/ui/Note'
import Stack from '@valley/ui/Stack'
import styles from './ConfirmFolderDeletion.module.css'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { ProjectGetReq, ProjectGetRes } from '@valley/shared'
import { api } from '../../../api'
import { deleteFolder } from '../../../api/folders'
import { Folder } from '@valley/db'

const findFolderFromData = (
  data: ProjectGetRes | undefined,
  folderId: Folder['id']
) => data?.folders.find((e) => e.id === folderId)

type ConfirmFolderDeletionModalProps = {
  onClose: () => void
}

const ConfirmFolderDeletionModal: React.FC<ConfirmFolderDeletionModalProps> = ({
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const { id: projectId } = useParams()
  const router = useRouter()
  const { data, mutate } = useSWR<ProjectGetRes, ProjectGetReq>(
    '/projects/' + projectId,
    api({ isAccessTokenRequired: true })
  )
  const searchParams = useSearchParams()
  const modalPropsFolderId = searchParams.get('modal-folderId')
  const searchParamsFolderId = searchParams.get('folder')
  const folderId = Number(modalPropsFolderId || searchParamsFolderId)
  const [folder, setFolder] = useState(findFolderFromData(data, folderId))
  const folderTitlePattern = `\\s*${folder?.title}\\s*`
  const deleteConfirmPattern = '\\s*delete my folder\\s*'
  const isFolderWithFiles = folder && folder.totalFiles > 0

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const res = await deleteFolder(Number(projectId), folderId)

    if (res.ok) {
      mutate((prev) => {
        if (!prev) return undefined
        return {
          ...prev,
          folders: prev.folders.filter((e) => e.id !== folderId),
        }
      })

      router.push(`/projects/${projectId}`)
    }
  }

  useEffect(() => {
    if (!data) return
    const foundFolder = findFolderFromData(data, folderId)
    foundFolder && setFolder(foundFolder)
  }, [data])

  return (
    <form id="confirm-folder-deletion-form" onSubmit={handleSubmit}>
      <ModalHeader>Delete Folder</ModalHeader>
      <Stack
        gap={4}
        padding={6}
        direction="column"
        className={styles.confirmFolderDeletion__content}
      >
        <p>
          Folder <b>"{folder?.title}"</b>
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
      </Stack>
      {isFolderWithFiles && (
        <Stack
          direction={'column'}
          gap={6}
          padding={6}
          className={styles.confirmFolderDeletion__form}
        >
          <label>
            <Stack gap={2} direction="column">
              <p className={styles.confirmFolderDeletion__formLabel}>
                Enter the folder title <b>{folder?.title}</b> to continue:
              </p>
              <Input
                required
                pattern={folderTitlePattern}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                type="text"
                name="resourceName"
              />
            </Stack>
          </label>
          <label>
            <Stack gap={2} direction="column">
              <p className={styles.confirmFolderDeletion__formLabel}>
                To verify, type <b>delete my folder</b> below:
              </p>
              <Input
                required
                pattern={deleteConfirmPattern}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                type="text"
                name="resourceName"
              />
            </Stack>
          </label>
        </Stack>
      )}
      <ModalFooter
        className={styles.confirmFolderDeletion__footer}
        before={
          <Button
            tabIndex={0}
            autoFocus
            onClick={onClose}
            variant="secondary-dimmed"
            size="md"
            disabled={isLoading}
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
            disabled={isLoading}
            loading={isLoading}
          >
            {isFolderWithFiles ? 'Continue' : 'Delete'}
          </Button>
        }
      />
    </form>
  )
}

export default ConfirmFolderDeletionModal
