'use client'
import React, { useMemo, useState } from 'react'
import Button from '@valley/ui/Button'
import Divider from '@valley/ui/Divider'
import Link from 'next/link'
import styles from './Project.module.css'
import { PencilEdit, Plus, Share } from 'geist-ui-icons'
import useSWR from 'swr'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
  FolderGetReq,
  FolderGetRes,
  ProjectGetReq,
  ProjectGetRes,
  SerializedFolder,
} from '@valley/shared'
import { api } from '../../../../api'
import PageHeader from '../../../../components/PageHeader/PageHeader'
import Wrapper from '@valley/ui/Wrapper'
import FolderCard from '../../../../components/FolderCard/FolderCard'
import IconButton from '@valley/ui/IconButton'
import { createFolder } from '../../../../api/folders'
import { formatBytes } from '../../../../utils/formatBytes'
import UploadButton from '../../../../components/UploadButton/UploadButton'
import FileCard from '../../../../components/FileCard/FileCard'
import Fade from '@valley/ui/Fade'

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
  const { data: folderResponse } = useSWR<FolderGetRes, FolderGetReq>(
    // Do not fetch data when `folderId` is undefined
    parsedFolderId ? '/projects/' + id + '/folders/' + parsedFolderId : null,
    api({ isAccessTokenRequired: true })
  )
  const currentFolder = useMemo(
    () => data?.folders.find((e) => e.id === parsedFolderId),
    [data?.folders, parsedFolderId]
  )
  const projectTotalSize = data && formatBytes(data?.project.totalSize)

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

  const handleFolderClick = (folder: SerializedFolder) => {
    if (currentFolder?.id !== folder.id) {
      router.push(`/projects/${id}?folder=${folder.id}`)
    }
  }

  const handleEditFolderTitle = () => {
    if (!currentFolder) return

    router.push(
      `/projects/${id}?folder=${currentFolder.id}&modal=edit-folder-title`
    )
  }

  const handleEditFolderDescription = () => {
    if (!currentFolder) return

    router.push(
      `/projects/${id}?folder=${currentFolder.id}&modal=edit-folder-description`
    )
  }

  return (
    <div className={styles.project}>
      <PageHeader
        before={
          <>
            <Button size="lg" variant="secondary" before={<Share />}>
              Share project
            </Button>
            <Button
              onClick={handleEditFolderDescription}
              size="lg"
              variant="secondary"
              before={<PencilEdit />}
            >
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
          <Fade in={!!data?.folders} className={styles.project__foldersList}>
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
          </Fade>
          <Fade
            in={!!projectTotalSize}
            className={styles.project__foldersTotalSizeContainer}
          >
            <span className={styles.project__foldersTotalSizeCaption}>
              Total size
            </span>
            {projectTotalSize}
          </Fade>
        </Wrapper>
      </div>
      <Divider />

      <Wrapper className={styles.project__folderInfo}>
        {currentFolder?.title && (
          <div className={styles.project__folderTitleContainer}>
            {currentFolder?.title}
            <IconButton
              onClick={handleEditFolderTitle}
              variant="tertiary-dimmed"
            >
              <PencilEdit />
            </IconButton>
          </div>
        )}
        {currentFolder?.description && (
          <div className={styles.project__folderDescriptionContainer}>
            <p>{currentFolder?.description}</p>
            <IconButton
              onClick={handleEditFolderDescription}
              variant="tertiary-dimmed"
            >
              <PencilEdit />
            </IconButton>
          </div>
        )}
      </Wrapper>

      {data && parsedFolderId && (
        <Wrapper className={styles.project__files}>
          <UploadButton
            projectId={data?.project.id}
            folderId={parsedFolderId}
          />
          {folderResponse?.files.map((file) => (
            <FileCard key={file.key} file={file} />
          ))}
        </Wrapper>
      )}

      <Link style={{ textDecoration: 'none' }} href={'/projects'}>
        <Button>Go back</Button>
      </Link>
    </div>
  )
}

export default ProjectPage
