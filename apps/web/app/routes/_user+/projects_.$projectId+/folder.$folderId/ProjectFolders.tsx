import { Folder } from '@valley/db'
import { PROJECT_MAX_FOLDERS } from '@valley/shared'
import ButtonBase from '@valley/ui/ButtonBase'
import Hidden from '@valley/ui/Hidden'
import IconButton from '@valley/ui/IconButton'
import Wrapper from '@valley/ui/Wrapper'
import FolderCard from 'app/components/FolderCard/FolderCard'
import MenuExpand from 'app/components/svg/MenuExpand'
import { useModal } from 'app/hooks/useModal'
import { formatBytes } from 'app/utils/misc'
import { Plus } from 'geist-ui-icons'
import { useNavigate, useFetcher, Form, useParams } from 'react-router'
import { useRemixForm } from 'remix-hook-form'
import styles from './project.module.css'
import { useProject } from 'app/utils/project'
import { zodResolver } from '@hookform/resolvers/zod'
import { FoldersCreateSchema } from 'app/routes/api+/projects+/$projectId.folders+/create'
import { z } from 'zod'
import cx from 'classnames'
import React, { useCallback } from 'react'

type FormData = z.infer<typeof FoldersCreateSchema>
const resolver = zodResolver(FoldersCreateSchema)

const ProjectFolders: React.FC = () => {
  const navigate = useNavigate()
  const { openModal } = useModal()
  const { folderId } = useParams()
  const project = useProject()
  const currentFolder = project?.folders?.find((e) => e.id === folderId)
  const createFolderAction = '/api/projects/' + project?.id + '/folders/create'
  const projectTotalSize = formatBytes(Number(project?.totalSize || '0'))
  const createFolderFetcher = useFetcher({ key: createFolderAction })
  const { register, handleSubmit } = useRemixForm<FormData>({
    resolver,
    fetcher: createFolderFetcher,
    submitConfig: {
      navigate: false,
      replace: true,
      action: createFolderAction,
      method: 'POST',
    },
  })
  const isCreatingFolder = createFolderFetcher.state !== 'idle'
  const canCreateMoreFolders =
    (project?.folders?.length || 0) < PROJECT_MAX_FOLDERS

  const handleFolderClick = useCallback(
    (e: React.MouseEvent, folder: Folder) => {
      e.preventDefault()

      if (!project) return

      if (currentFolder?.id !== folder.id) {
        navigate('/projects/' + project.id + '/folder/' + folder.id, {
          replace: true,
        })
      }
    },
    [currentFolder?.id, navigate, project]
  )

  const handleOpenProjectFolders = () => {
    openModal('project-folders')
  }

  return (
    <Form id={'create-project-folder'} onSubmit={handleSubmit}>
      <input {...register('projectId', { value: project?.id })} hidden />
      <Hidden asChild lg xl>
        <ButtonBase
          variant="secondary"
          className={styles.project__foldersButton}
          onClick={handleOpenProjectFolders}
          type="button"
        >
          <div className={styles.project__foldersListFolderContainer}>
            <h5 className={styles.project__foldersListFolderTitle}>
              {currentFolder?.title}
            </h5>
            <div className={styles.project__foldersListFolderSubtitle}>
              <p>{currentFolder?.totalFiles} files</p>
              <span>•</span>
              <p>{formatBytes(Number(currentFolder?.totalSize || '0'))}</p>
            </div>
          </div>
          <MenuExpand />
        </ButtonBase>
      </Hidden>
      <Hidden sm md className={styles.project__foldersContainer}>
        <Wrapper className={styles.project__folders}>
          <div className={cx(styles.project__foldersList)}>
            {project?.folders?.map((folder, i) => (
              <FolderCard onClick={handleFolderClick} key={i} folder={folder} />
            ))}
            {canCreateMoreFolders && (
              <IconButton
                disabled={isCreatingFolder}
                loading={isCreatingFolder}
                variant="tertiary"
                size="lg"
                type="submit"
                form="create-project-folder"
              >
                <Plus />
              </IconButton>
            )}
          </div>
          <div className={styles.project__foldersTotalSizeContainer}>
            <span className={styles.project__foldersTotalSizeCaption}>
              Total size
            </span>
            {projectTotalSize}
          </div>
        </Wrapper>
      </Hidden>
    </Form>
  )
}

export default React.memo(ProjectFolders)
