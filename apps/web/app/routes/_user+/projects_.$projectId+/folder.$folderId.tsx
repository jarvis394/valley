import React, { Suspense, useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './project.module.css'
import PageHeader from 'app/components/PageHeader/PageHeader'
import Button from '@valley/ui/Button'
import { MoreHorizontal, PencilEdit, Plus, Share } from 'geist-ui-icons'
import Divider from '@valley/ui/Divider'
import Wrapper from '@valley/ui/Wrapper'
import { GeneralErrorBoundary } from 'app/components/ErrorBoundary'
import IconButton from '@valley/ui/IconButton'
import Menu from '@valley/ui/Menu'
import FolderCard from 'app/components/FolderCard/FolderCard'
import cx from 'classnames'
import { formatBytes } from 'app/utils/misc'
import {
  data,
  HeadersFunction,
  LoaderFunctionArgs,
  SerializeFrom,
} from '@remix-run/cloudflare'
import { prisma } from 'app/server/db.server'
import {
  combineServerTimings,
  makeTimings,
  time,
} from 'app/server/timing.server'
import { getUserIdFromSession } from 'app/server/auth/auth.server'
import {
  Await,
  ClientLoaderFunctionArgs,
  Form,
  redirect,
  ShouldRevalidateFunction,
  useFetcher,
  useLoaderData,
  useNavigate,
  useParams,
  useSearchParams,
} from '@remix-run/react'
import FileCard from 'app/components/FileCard/FileCard'
import UploadButton from 'app/components/UploadButton/UploadButton'
import { File, Folder } from '@valley/db'
import { useProjectAwait } from 'app/utils/project'
import {
  FolderWithFiles,
  PROJECT_MAX_FOLDERS,
  ProjectWithFolders,
} from '@valley/shared'
import { formatNewLine } from 'app/utils/format-new-line'
import { cache } from 'app/utils/client-cache'
import { invariantResponse } from 'app/utils/invariant'
import { useRemixForm } from 'remix-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FoldersCreateSchema } from 'app/routes/api+/folders+/create'
import Hidden from '@valley/ui/Hidden'
import Stack from '@valley/ui/Stack'
import Spinner from '@valley/ui/Spinner'
import ButtonBase from '@valley/ui/ButtonBase'
import MenuExpand from 'app/components/svg/MenuExpand'
import ProjectFoldersModal from 'app/components/ProjectFoldersModal/ProjectFoldersModal'
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
import { getProjectCacheKey } from './_layout'

type FormData = z.infer<typeof FoldersCreateSchema>

const resolver = zodResolver(FoldersCreateSchema)

export const getFolderCacheKey = (folderId: Folder['id']) =>
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
  const folder = time(
    () => {
      return prisma.folder.findFirst({
        where: {
          Project: {
            id: projectId,
            userId,
          },
          id: folderId,
        },
        include: {
          files: {
            where: {
              isPendingDeletion: false,
            },
          },
        },
      })
    },
    {
      timings,
      type: 'get folder',
    }
  )

  return data(
    { folder, cached: false },
    { headers: { 'Server-Timing': timings.toString() } }
  )
}

let initialLoad = true
export async function clientLoader({
  serverLoader,
  params,
}: ClientLoaderFunctionArgs) {
  if (!params.folderId) {
    return redirect('/projects')
  }

  const key = getFolderCacheKey(params.folderId)
  const cacheEntry = await cache.getItem(key)
  if (cacheEntry && !initialLoad) {
    return { folder: cacheEntry, cached: true }
  }

  initialLoad = false

  const loaderData = (await serverLoader()) as SerializeFrom<typeof loader>
  const folder = loaderData.folder

  return { folder }
}

clientLoader.hydrate = true

export const headers: HeadersFunction = ({ loaderHeaders, parentHeaders }) => {
  return {
    'Server-Timing': combineServerTimings(parentHeaders, loaderHeaders),
  }
}

export const shouldRevalidate: ShouldRevalidateFunction = ({
  formAction,
  currentParams,
  defaultShouldRevalidate,
}) => {
  if (formAction && currentParams.folderId) {
    cache.removeItem(getFolderCacheKey(currentParams.folderId))
    return true
  }

  return defaultShouldRevalidate
}

const ProjectHeader: React.FC<{
  project: ProjectWithFolders | null
  currentFolder?: Folder
}> = ({ project, currentFolder }) => {
  const [searchParams, setSearchParams] = useSearchParams()

  const handleEditFolderDescription = () => {
    if (!currentFolder) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('modal', 'edit-folder-description')
    params.set('modal-folderId', currentFolder.id.toString())
    setSearchParams(params, {
      state: {
        defaultDescription: currentFolder.description,
      },
      preventScrollReset: true,
    })
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
          <Button size="lg" variant="primary">
            Preview
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
  project: ProjectWithFolders | null
  currentFolder?: Folder
}> = ({ project, currentFolder }) => {
  const navigate = useNavigate()
  const [isFoldersModalOpen, setFoldersModalOpen] = useState(false)
  const createFolderAction = '/api/folders/create'
  const projectTotalSize = formatBytes(Number(project?.totalSize) || 0)
  const createFolderFetcher = useFetcher()
  const { register, handleSubmit } = useRemixForm<FormData>({
    resolver,
    fetcher: createFolderFetcher,
    submitConfig: {
      navigate: false,
      action: createFolderAction,
      method: 'POST',
      flushSync: true,
    },
  })
  const isCreatingFolder = createFolderFetcher.state !== 'idle'
  const canCreateMoreFolders =
    (project?.folders.length || 0) < PROJECT_MAX_FOLDERS

  const handleFolderClick = (folder: Folder) => {
    setFoldersModalOpen(false)

    if (!project) return

    if (currentFolder?.id !== folder.id) {
      navigate('/projects/' + project.id + '/folder/' + folder.id)
    }
  }

  return (
    <Form id={'create-project-folder'} onSubmit={handleSubmit}>
      <input {...register('projectId', { value: project?.id })} hidden />
      <Hidden asChild lg xl>
        <ButtonBase
          variant="secondary"
          className={styles.project__foldersButton}
          onClick={() => setFoldersModalOpen(true)}
          type="button"
        >
          <div className={styles.project__foldersListFolderContainer}>
            <h5 className={styles.project__foldersListFolderTitle}>
              {currentFolder?.title}
            </h5>
            <div className={styles.project__foldersListFolderSubtitle}>
              <p>{currentFolder?.totalFiles} files</p>
              <span>•</span>
              <p>{formatBytes(Number(currentFolder?.totalSize))}</p>
            </div>
          </div>
          <MenuExpand />
        </ButtonBase>
      </Hidden>
      <Hidden sm md className={styles.project__foldersContainer}>
        <Wrapper className={styles.project__folders}>
          <div className={cx(styles.project__foldersList)}>
            {project?.folders.map((folder, i) => (
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
      <ProjectFoldersModal
        project={project}
        createFolderFetcher={createFolderFetcher}
        isOpen={isFoldersModalOpen}
        onDismiss={() => setFoldersModalOpen(false)}
      />
    </Form>
  )
}

const FolderInfo: React.FC<{ currentFolder?: Folder }> = ({
  currentFolder,
}) => {
  const [searchParams, setSearchParams] = useSearchParams()

  const handleEditFolderTitle = () => {
    if (!currentFolder) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('modal', 'edit-folder-title')
    params.set('modal-folderId', currentFolder.id.toString())
    setSearchParams(params, {
      state: {
        defaultTitle: currentFolder.title,
      },
      preventScrollReset: true,
    })
  }

  const handleEditFolderDescription = () => {
    if (!currentFolder) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('modal', 'edit-folder-description')
    params.set('modal-folderId', currentFolder.id.toString())
    setSearchParams(params, {
      state: {
        defaultDescription: currentFolder.description,
      },
      preventScrollReset: true,
    })
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

const ProjectBlock: React.FC<{
  project: ProjectWithFolders | null
}> = ({ project }) => {
  const { folderId } = useParams()
  const currentFolder = project?.folders.find((e) => e.id === folderId)

  useEffect(() => {
    if (!project) return
    const key = getProjectCacheKey(project.id)
    const putProjectDataToCache = async () => await cache.setItem(key, project)
    putProjectDataToCache()
  }, [project])

  return (
    <>
      <ProjectHeader project={project} currentFolder={currentFolder} />
      <Divider />
      <ProjectFolders project={project} currentFolder={currentFolder} />
      <Divider />
      <FolderInfo currentFolder={currentFolder} />
    </>
  )
}

const FolderFiles: React.FC<{
  folder: FolderWithFiles | null
}> = ({ folder }) => {
  const id = useId()
  const [files, setFiles] = useState(folder?.files || [])
  const [activeFileId, setActiveFileId] = useState<File['id'] | null>(null)
  const activeFile = files.find((e) => e.id === activeFileId)
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        distance: Infinity,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveFileId(event.active.id.toString())
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setFiles((prevFiles) => {
        const oldIndex = prevFiles.findIndex((e) => e.id === active.id)
        const newIndex = prevFiles.findIndex((e) => e.id === over?.id)

        return arrayMove(prevFiles, oldIndex, newIndex)
      })
      setActiveFileId(null)
    }
  }

  useEffect(() => {
    setFiles(folder?.files || [])
  }, [folder?.files])

  useEffect(() => {
    if (!folder) return
    const key = getFolderCacheKey(folder.id)
    const putFolderDataToCache = async () => await cache.setItem(key, folder)
    putFolderDataToCache()
  }, [folder])

  if (!folder) return null

  if (folder.files.length === 0) {
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
    <Stack direction={'column'} gap={{ sm: 4, md: 8 }}>
      <Hidden asChild md lg xl>
        <Stack asChild align={'center'} justify={'center'}>
          <Wrapper>
            <UploadButton
              projectId={folder.projectId}
              folderId={folder.id}
              variant="compact"
            />
          </Wrapper>
        </Stack>
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
              disabled
              items={files}
              strategy={rectSortingStrategy}
            >
              <Hidden sm>
                <UploadButton
                  projectId={folder.projectId}
                  folderId={folder.id}
                  variant="square"
                />
              </Hidden>
              {files.map((file) => (
                <FileCard key={file.id} file={file} />
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

const Fallback = () => (
  <Stack direction={'row'} padding={6} justify={'center'}>
    <Spinner />
  </Stack>
)

const ProjectRoute = () => {
  const projectData = useProjectAwait()
  const data = useLoaderData<typeof loader>()

  return (
    <div className={styles.project}>
      <Suspense fallback={<Fallback />}>
        <Await resolve={projectData?.project}>
          {(project) => <ProjectBlock project={project || null} />}
        </Await>
      </Suspense>
      <Suspense fallback={<Fallback />}>
        <Await resolve={data.folder}>
          {(folder) => <FolderFiles folder={folder} />}
        </Await>
      </Suspense>
    </div>
  )
}

export const ErrorBoundary = GeneralErrorBoundary

export default React.memo(ProjectRoute)
