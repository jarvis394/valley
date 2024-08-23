'use client'
import React, { useMemo, useState } from 'react'
import Button from '@valley/ui/Button'
import Divider from '@valley/ui/Divider'
import Link from 'next/link'
import styles from './Project.module.css'
import { CloudUpload, PencilEdit, Plus, Share } from 'geist-ui-icons'
import { ProgressBar } from '@uppy/react'
import { useUpload } from '../../../../hooks/useUpload'
import useSWR from 'swr'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ProjectGetReq, ProjectGetRes } from '@valley/shared'
import { api } from '../../../../api'
import PageHeader from '../../../../components/PageHeader/PageHeader'
import Wrapper from '@valley/ui/Wrapper'
import FolderCard from '../../../../components/FolderCard/FolderCard'
import IconButton from '@valley/ui/IconButton'
import { createFolder } from '../../../../api/folders'
import { Folder } from '@valley/db'

const ProjectPage: React.FC = () => {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const { data, mutate } = useSWR<ProjectGetRes, ProjectGetReq>(
    '/projects/' + id,
    api({ isAccessTokenRequired: true })
  )
  const folderId = searchParams.get('folder')
  const parsedFolderId = folderId ? Number(folderId) : data?.folders[0]?.id
  const currentFolder = useMemo(
    () => data?.folders.find((e) => e.id === parsedFolderId),
    [data?.folders, parsedFolderId]
  )
  const { uppy, register, openFilePicker } = useUpload()

  const handleCreateFolder = async () => {
    if (!data) return

    setIsCreatingFolder(true)
    const res = await createFolder({
      description: null,
      title: 'Folder',
      projectId: data.project.id,
    })
    mutate({
      ...data,
      folders: [...data.folders, res.folder],
    })
    setIsCreatingFolder(false)
  }

  const handleFolderClick = (folder: Folder) => {
    router.push(`/projects/${id}?folder=${folder.id}`)
  }

  return (
    <div className={styles.project}>
      <PageHeader
        before={
          <>
            <Button size="lg" variant="secondary" before={<Share />}>
              Share project
            </Button>
            <Button size="lg" variant="secondary" before={<PencilEdit />}>
              Edit description
            </Button>
            <Button size="lg" variant="primary">
              Preview
            </Button>
          </>
        }
      >
        {data?.project.title}
      </PageHeader>
      <Divider />
      <div className={styles.project__foldersContainer}>
        <Wrapper className={styles.project__folders}>
          <div className={styles.project__foldersList}>
            {data?.folders.map((folder, i) => (
              <FolderCard
                onClick={handleFolderClick}
                active={parsedFolderId === folder.id}
                key={i}
                folder={folder}
              />
            ))}
            <IconButton
              disabled={isCreatingFolder}
              loading={isCreatingFolder}
              variant="tertiary"
              size="lg"
              onClick={handleCreateFolder}
            >
              <Plus />
            </IconButton>
          </div>
          <div className={styles.project__foldersTotalSizeContainer}>
            <span className={styles.project__foldersTotalSizeCaption}>
              Total size
            </span>
            {data?.project.totalSize} MB
          </div>
        </Wrapper>
      </div>
      <Divider />

      <Wrapper className={styles.project__titleAndDescriptionContainer}>
        {currentFolder?.title && (
          <div className={styles.project__titleContainer}>
            {currentFolder?.title}
            <IconButton variant="tertiary-dimmed">
              <PencilEdit />
            </IconButton>
          </div>
        )}
        {currentFolder?.description && (
          <div className={styles.project__descriptionContainer}>
            {currentFolder?.description}
            <IconButton variant="tertiary-dimmed">
              <PencilEdit />
            </IconButton>
          </div>
        )}
      </Wrapper>

      <Link style={{ textDecoration: 'none' }} href={'/projects'}>
        <Button>Go back</Button>
      </Link>
      <div>
        <Button
          onClick={openFilePicker}
          variant="primary"
          before={<CloudUpload />}
          size="md"
        >
          Upload file
        </Button>
        <input {...register()} />
        <ProgressBar uppy={uppy} fixed hideAfterFinish />
      </div>
    </div>
  )
}

export default ProjectPage
