import React, { Suspense, useEffect } from 'react'
import styles from './project.module.css'
import PageHeader from 'app/components/PageHeader/PageHeader'
import Button from '@valley/ui/Button'
import { PencilEdit, Plus, Share } from 'geist-ui-icons'
import Divider from '@valley/ui/Divider'
import Wrapper from '@valley/ui/Wrapper'
import { GeneralErrorBoundary } from 'app/components/ErrorBoundary'
import IconButton from '@valley/ui/IconButton'
import FolderCard from 'app/components/FolderCard/FolderCard'
import cx from 'classnames'
import { formatBytes, useIsPending } from 'app/utils/misc'
import {
  data,
  HeadersFunction,
  LoaderFunctionArgs,
  SerializeFrom,
} from '@remix-run/node'
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
  useLoaderData,
  useNavigate,
  useParams,
  useSearchParams,
} from '@remix-run/react'
import FileCard from 'app/components/FileCard/FileCard'
import UploadButton from 'app/components/UploadButton/UploadButton'
import { Folder } from '@valley/db'
import { useProjectsStore } from 'app/stores/projects'
import Animated from '@valley/ui/Animated'
import { useProjectAwait } from 'app/utils/project'
import { FolderWithFiles, ProjectWithFolders } from '@valley/shared'
import { formatNewLine } from 'app/utils/format-new-line'
import { cache } from 'app/utils/client-cache'
import { invariantResponse } from 'app/utils/invariant'
import { useRemixForm } from 'remix-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FoldersCreateSchema } from 'app/routes/api+/folders+/create'

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
          files: true,
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
  const folder = await loaderData.folder
  await cache.setItem(key, folder)

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
}> = ({ project }) => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { folderId } = useParams()
  const currentFolder = project?.folders.find((e) => e.id === folderId)
  const projectTotalSize = formatBytes(Number(project?.totalSize) || 0)
  const createFolderAction = '/api/folders/create'
  const { register, handleSubmit } = useRemixForm<FormData>({
    resolver,
    submitConfig: {
      action: createFolderAction,
      method: 'POST',
    },
  })
  const isCreatingFolder = useIsPending({
    formAction: createFolderAction,
  })

  const handleFolderClick = (folder: Folder) => {
    if (!project) return

    if (currentFolder?.id !== folder.id) {
      navigate('/projects/' + project.id + '/folder/' + folder.id)
    }
  }

  const handleEditFolderTitle = () => {
    if (!currentFolder) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('modal', 'edit-folder-title')
    params.set('modal-folderId', currentFolder.id.toString())
    setSearchParams(params, {
      state: {
        defaultTitle: currentFolder.title,
      },
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
    })
  }

  return (
    <>
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
        {project?.title}
      </PageHeader>
      <Divider />
      <div className={styles.project__foldersContainer}>
        <Wrapper className={styles.project__folders}>
          <div className={cx(styles.project__foldersList)}>
            {project?.folders.map((folder, i) => (
              <FolderCard onClick={handleFolderClick} key={i} folder={folder} />
            ))}
            <Form onSubmit={handleSubmit}>
              <input
                {...register('projectId', { value: project?.id })}
                hidden
              />
              <IconButton
                disabled={isCreatingFolder}
                loading={isCreatingFolder}
                variant="tertiary"
                size="lg"
                type="submit"
              >
                <Plus />
              </IconButton>
            </Form>
          </div>
          <div className={styles.project__foldersTotalSizeContainer}>
            <span className={styles.project__foldersTotalSizeCaption}>
              Total size
            </span>
            <Animated>{projectTotalSize}</Animated>
          </div>
        </Wrapper>
      </div>
      <Divider />
      <Wrapper className={styles.project__folderInfo}>
        <div className={styles.project__folderTitleContainer}>
          {currentFolder?.title}
          <IconButton onClick={handleEditFolderTitle} variant="tertiary-dimmed">
            <PencilEdit />
          </IconButton>
        </div>
        {currentFolder?.description && (
          <div className={styles.project__folderDescriptionContainer}>
            <Animated asChild>
              <p>{formatNewLine(currentFolder?.description)}</p>
            </Animated>
            <IconButton
              onClick={handleEditFolderDescription}
              variant="tertiary-dimmed"
            >
              <PencilEdit />
            </IconButton>
          </div>
        )}
      </Wrapper>
    </>
  )
}

const FolderComponent: React.FC<{
  folder: FolderWithFiles | null
}> = ({ folder }) => {
  const setFilesToStore = useProjectsStore((state) => state.setFiles)
  const files = folder?.files

  useEffect(() => {
    folder?.files && setFilesToStore(folder?.files)
  }, [folder?.files, setFilesToStore])

  return (
    <Wrapper className={styles.project__files}>
      {folder && (
        <UploadButton projectId={folder.projectId} folderId={folder.id} />
      )}

      {files?.map((file, i) => (
        // TODO: investigate `key`, somewhy `key={file.id}` throws React error of 2 duplicate keys
        // TODO: `key={i}` is a quick fix
        <FileCard key={i} file={file} />
      ))}
    </Wrapper>
  )
}

const ProjectRoute = () => {
  const projectData = useProjectAwait()
  const data = useLoaderData<typeof loader>()

  return (
    <div className={styles.project}>
      <Suspense fallback={<h1>loading project...</h1>}>
        <Await resolve={projectData?.project}>
          {(project) => <ProjectHeader project={project || null} />}
        </Await>
      </Suspense>
      <Suspense fallback={<h1>loading folder...</h1>}>
        <Await resolve={data.folder}>
          {(folder) => <FolderComponent folder={folder} />}
        </Await>
      </Suspense>
    </div>
  )
}

export const ErrorBoundary = GeneralErrorBoundary

export default React.memo(ProjectRoute)
