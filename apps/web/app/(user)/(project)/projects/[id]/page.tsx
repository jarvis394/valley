'use client'
import React, { useMemo, useState } from 'react'
import Button from '@valley/ui/Button'
import Divider from '@valley/ui/Divider'
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
import cx from 'classnames'

const ProjectPage: React.FC = () => {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const {
    data,
    mutate,
    isLoading: isLoadingProject,
  } = useSWR<ProjectGetRes, ProjectGetReq>(
    '/projects/' + id,
    api({ isAccessTokenRequired: true })
  )
  const folderId = searchParams.get('folder')
  const parsedFolderId = folderId ? Number(folderId) : data?.folders[0]?.id
  const { data: folderResponse, isLoading: isLoadingFolders } = useSWR<
    FolderGetRes,
    FolderGetReq
  >(
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
    const params = new URLSearchParams(searchParams.toString())
    params.set('folder', currentFolder.id.toString())
    params.set('modal', 'edit-folder-title')
    params.set('modal-folderId', currentFolder.id.toString())
    router.push(`/projects/${id}?${params.toString()}`)
  }

  const handleEditFolderDescription = () => {
    if (!currentFolder) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('folder', currentFolder.id.toString())
    params.set('modal', 'edit-folder-description')
    params.set('modal-folderId', currentFolder.id.toString())
    router.push(`/projects/${id}?${params.toString()}`)
  }

  return (
    <div className={styles.project}>
      <PageHeader
        headerProps={{
          className: 'fade',
          ['data-fade-in' as string]: !isLoadingProject,
        }}
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
          <div
            data-fade-in={!isLoadingFolders}
            className={cx(styles.project__foldersList, 'fade')}
          >
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
          <div
            data-fade-in={!!projectTotalSize}
            className={cx(styles.project__foldersTotalSizeContainer, 'fade')}
          >
            <span className={styles.project__foldersTotalSizeCaption}>
              Total size
            </span>
            {projectTotalSize}
          </div>
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
          {folderResponse?.files.map((file, i) => (
            // TODO: investigate `key`, somewhy `key={file.id}` throws React error of 2 duplicate keys
            // TODO: `key={i}` is a quick fix
            <FileCard key={i} file={file} />
          ))}
        </Wrapper>
      )}
    </div>
  )
}

export default ProjectPage
