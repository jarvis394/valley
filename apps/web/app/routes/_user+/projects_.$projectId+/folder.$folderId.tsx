import React, { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './project.module.css'
import PageHeader from 'app/components/PageHeader/PageHeader'
import Button from '@valley/ui/Button'
import {
  MoreHorizontal,
  PencilEdit,
  Plus,
  Share,
  SortAscending,
} from 'geist-ui-icons'
import Divider from '@valley/ui/Divider'
import Wrapper from '@valley/ui/Wrapper'
import { GeneralErrorBoundary } from 'app/components/ErrorBoundary'
import IconButton from '@valley/ui/IconButton'
import Menu from '@valley/ui/Menu'
import FolderCard from 'app/components/FolderCard/FolderCard'
import cx from 'classnames'
import { formatBytes } from 'app/utils/misc'
import { data, HeadersFunction, LoaderFunctionArgs } from '@remix-run/node'
import {
  combineServerTimings,
  makeTimings,
  time,
} from 'app/server/timing.server'
import { getUserIdFromSession } from 'app/server/auth/auth.server'
import {
  ClientLoaderFunction,
  Form,
  redirect,
  ShouldRevalidateFunction,
  useFetcher,
  useNavigate,
  useParams,
} from '@remix-run/react'
import FileCard from 'app/components/FileCard/FileCard'
import UploadButton from 'app/components/UploadButton/UploadButton'
import type { File, Folder } from '@valley/db'
import { useProject } from 'app/utils/project'
import {
  FolderWithFiles,
  PROJECT_MAX_FOLDERS,
  ProjectWithFolders,
} from '@valley/shared'
import { formatNewLine } from 'app/utils/format-new-line'
import {
  cacheClientLoader,
  invalidateCache,
  useCachedLoaderData,
} from 'app/utils/cache'
import { invariantResponse } from 'app/utils/invariant'
import { useRemixForm } from 'remix-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FoldersCreateSchema } from 'app/routes/api+/folders+/create'
import Hidden from '@valley/ui/Hidden'
import Stack from '@valley/ui/Stack'
import ButtonBase from '@valley/ui/ButtonBase'
import MenuExpand from 'app/components/svg/MenuExpand'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { ClientOnly } from 'remix-utils/client-only'
import { useModal } from 'app/hooks/useModal'
import { getProjectFolder } from 'app/server/folder/folder.server'
import { useProjectsStore } from 'app/stores/projects'
import { useRootLoaderData } from 'app/root'
import { useUserStore } from 'app/utils/user'

type FormData = z.infer<typeof FoldersCreateSchema>

const resolver = zodResolver(FoldersCreateSchema)

export const getFolderCacheKey = (folderId?: Folder['id']) =>
  `folder:${folderId}`

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { projectId, folderId } = params
  invariantResponse(folderId, 'Missing folder ID in route params')
  invariantResponse(projectId, 'Missing project ID in route params')

  const timings = makeTimings('project folder loader')
  const userId = await time(getUserIdFromSession(request), {
    timings,
    type: 'folder get userId from session',
  })

  if (!userId) {
    return redirect('/auth/login')
  }

  const folder = await time(getProjectFolder({ userId, projectId, folderId }), {
    timings,
    type: 'get folder',
  })

  if (!folder) {
    return redirect('/projects/' + projectId)
  }

  return data({ folder }, { headers: { 'Server-Timing': timings.toString() } })
}

export const clientLoader: ClientLoaderFunction = ({ params, ...props }) => {
  if (!params.folderId) {
    return redirect('/projects')
  }

  return cacheClientLoader(
    { params, ...props },
    { type: 'swr', key: getFolderCacheKey(params.folderId) }
  )
}

clientLoader.hydrate = true

export const headers: HeadersFunction = ({ loaderHeaders, parentHeaders }) => {
  return { 'Server-Timing': combineServerTimings(parentHeaders, loaderHeaders) }
}

export const shouldRevalidate: ShouldRevalidateFunction = ({
  formAction,
  currentParams,
  nextParams,
}) => {
  if (formAction && currentParams.folderId) {
    invalidateCache(getFolderCacheKey(currentParams.folderId))
    return true
  }

  if (
    currentParams.folderId &&
    currentParams.folderId !== nextParams.folderId
  ) {
    return true
  }

  return false
}

const ProjectHeader: React.FC<{
  project?: ProjectWithFolders | null
  currentFolder?: Folder
}> = ({ project, currentFolder }) => {
  const {
    ENV: { GALLERY_SERVICE_URL },
  } = useRootLoaderData()
  const user = useUserStore((state) => state.data)
  const { openModal } = useModal()
  const galleryUrl =
    user &&
    project &&
    [GALLERY_SERVICE_URL, user.domains[0], 'gallery', project.url].join('/')

  const handleEditFolderDescription = () => {
    if (!currentFolder) return
    openModal('edit-folder-description', { folderId: currentFolder.id })
  }

  return (
    <PageHeader
      before={
        <Menu.Root>
          <Hidden md lg xl asChild>
            <Menu.Trigger asChild>
              <IconButton variant="secondary" size="lg">
                <MoreHorizontal />
              </IconButton>
            </Menu.Trigger>
          </Hidden>
          <Button size="lg" variant="secondary" before={<Share />}>
            Share{' '}
            <Hidden sm asChild>
              <span>project</span>
            </Hidden>
          </Button>
          <Hidden asChild sm>
            <Button
              onClick={handleEditFolderDescription}
              size="lg"
              variant="secondary"
              before={<PencilEdit />}
            >
              Edit description
            </Button>
          </Hidden>
          <Button
            className={cx(styles.project__headerVisitButton, {
              [styles['project__headerVisitButton--disabled']]: !galleryUrl,
            })}
            size="lg"
            variant="primary"
            asChild
          >
            <a
              href={galleryUrl || '#'}
              target="_blank"
              rel="noreferrer noopener"
            >
              Visit
            </a>
          </Button>
          <Menu.Content>
            <Menu.Item before={<Share />}>Share project</Menu.Item>
            <Menu.Item
              onClick={handleEditFolderDescription}
              before={<PencilEdit />}
            >
              Edit description
            </Menu.Item>
          </Menu.Content>
        </Menu.Root>
      }
    >
      {project?.title}
    </PageHeader>
  )
}

const ProjectFolders: React.FC<{
  project?: ProjectWithFolders | null
  currentFolder?: Folder
}> = ({ project, currentFolder }) => {
  const navigate = useNavigate()
  const { openModal } = useModal()
  const createFolderAction = '/api/folders/create'
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

  const handleFolderClick = (e: React.MouseEvent, folder: Folder) => {
    e.preventDefault()

    if (!project) return

    if (currentFolder?.id !== folder.id) {
      navigate('/projects/' + project.id + '/folder/' + folder.id)
    }
  }

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

const FolderInfo: React.FC<{ currentFolder?: Folder }> = ({
  currentFolder,
}) => {
  const { openModal } = useModal()

  const handleEditFolderTitle = () => {
    if (!currentFolder) return
    openModal('edit-folder-title', { folderId: currentFolder.id })
  }

  const handleEditFolderDescription = () => {
    if (!currentFolder) return
    openModal('edit-folder-description', { folderId: currentFolder.id })
  }

  return (
    <Wrapper className={styles.project__folderInfo}>
      <div className={styles.project__folderTitleContainer}>
        {currentFolder?.title}
        <IconButton onClick={handleEditFolderTitle} variant="tertiary-dimmed">
          <PencilEdit />
        </IconButton>
      </div>
      {currentFolder?.description && (
        <div className={styles.project__folderDescriptionContainer}>
          <p>{formatNewLine(currentFolder?.description)}</p>
          <IconButton
            onClick={handleEditFolderDescription}
            variant="tertiary-dimmed"
          >
            <PencilEdit />
          </IconButton>
        </div>
      )}
    </Wrapper>
  )
}

const ProjectBlock = React.memo(function ProjectBlock() {
  const { folderId } = useParams()
  const project = useProject()
  const currentFolder = project?.folders?.find((e) => e.id === folderId)

  return (
    <>
      <ProjectHeader project={project} currentFolder={currentFolder} />
      <Divider />
      <ProjectFolders project={project} currentFolder={currentFolder} />
      <Divider />
      <FolderInfo currentFolder={currentFolder} />
    </>
  )
})

const FolderFiles: React.FC<{ folder: FolderWithFiles | null }> = ({
  folder,
}) => {
  const id = useId()
  const folderId = folder?.id || ''
  const projectId = folder?.projectId || ''
  const storeFiles = useProjectsStore(
    (state) => state.projects[projectId]?.folders[folderId]?.files
  )
  const files = storeFiles || folder?.files || []
  const setFiles = useProjectsStore((state) => state.setFiles)
  const [activeFileId, setActiveFileId] = useState<File['id'] | null>(null)
  const activeFile = files.find((e) => e.id === activeFileId)
  const cover = files.find((e) => e?.Cover?.find((c) => c.fileId === e.id))
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { delay: 200, tolerance: 5, distance: Infinity },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 500, tolerance: 5, distance: Infinity },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveFileId(event.active.id.toString())
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over?.id) {
      const oldIndex = files.findIndex((e) => e.id === active.id)
      const newIndex = files.findIndex((e) => e.id === over?.id)

      setActiveFileId(null)
      setFiles({
        projectId,
        folderId,
        files: arrayMove(files, oldIndex, newIndex),
      })
    }
  }

  // Set the folder's files to the cache store
  // Used for optimistic updates
  useEffect(() => {
    setFiles({ projectId, folderId, files: folder?.files || [] })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId, projectId, folder?.files])

  if (!folder) return null

  if (files.length === 0) {
    return (
      <Stack
        fullHeight
        fullWidth
        direction={'column'}
        gap={6}
        align={'center'}
        justify={'center'}
        className={styles.project__placeholder}
        padding={8}
      >
        <Stack direction={'column'} gap={4} align={'center'} justify={'center'}>
          <h1>This folder does not contain any files</h1>
          <p>Upload some photos to make it happier</p>
        </Stack>
        <UploadButton
          projectId={folder.projectId}
          folderId={folder.id}
          variant="button"
        />
      </Stack>
    )
  }

  return (
    <Stack direction={'column'} gap={{ sm: 3, md: 4 }}>
      <Hidden asChild md lg xl>
        <Stack asChild gap={3} align={'center'} justify={'center'}>
          <Wrapper>
            <UploadButton
              projectId={folder.projectId}
              folderId={folder.id}
              variant="compact"
            />
            <IconButton variant="secondary-dimmed" size="xl">
              <SortAscending />
            </IconButton>
          </Wrapper>
        </Stack>
      </Hidden>
      <Hidden sm asChild>
        <Wrapper asChild>
          <Stack gap={4} align={'center'} justify={'space-between'}>
            <Stack gap={4} align={'center'}>
              <UploadButton
                projectId={folder.projectId}
                folderId={folder.id}
                variant="button"
                size="md"
              />
              <p className={styles.project__uploadHint}>
                You can also drop files anywhere on the page
              </p>
            </Stack>
            <Button
              variant="secondary-dimmed"
              size="md"
              before={<SortAscending />}
            >
              Sort by date shot
            </Button>
          </Stack>
        </Wrapper>
      </Hidden>
      <Wrapper className={styles.project__files} asChild>
        <ul>
          <DndContext
            id={id}
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
            autoScroll
          >
            <SortableContext
              // disabled
              items={files}
              strategy={rectSortingStrategy}
            >
              {files.map((file) => (
                <FileCard
                  isCover={cover?.id === file.id}
                  key={file.id}
                  file={file}
                />
              ))}
              <ClientOnly>
                {() =>
                  createPortal(
                    <DragOverlay zIndex={2000}>
                      {activeFileId && activeFile && (
                        <FileCard
                          isOverlay
                          key={activeFileId}
                          file={activeFile}
                        />
                      )}
                    </DragOverlay>,
                    document.body
                  )
                }
              </ClientOnly>
            </SortableContext>
          </DndContext>
        </ul>
      </Wrapper>
    </Stack>
  )
}

const ProjectRoute = () => {
  const data = useCachedLoaderData<typeof loader>()

  return (
    <div className={styles.project}>
      <ProjectBlock />
      <FolderFiles folder={data.folder} />
    </div>
  )
}

export const ErrorBoundary = GeneralErrorBoundary

export default React.memo(ProjectRoute)
