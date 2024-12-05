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
import { formatBytes } from 'app/utils/misc'
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

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { url, folderId } = params
  const timings = makeTimings('project loader')
  const userId = await time(getUserIdFromSession(request), {
    timings,
    type: 'get userId from session',
  })
  const folder = time(
    prisma.folder.findFirst({
      where: {
        Project: {
          url,
          userId,
        },
        id: folderId,
      },
      include: {
        files: true,
      },
    }),
    { timings, type: 'get folder' }
  )

  return data({ folder }, { headers: { 'Server-Timing': timings.toString() } })
}

export const clientLoader = ({ serverLoader }: ClientLoaderFunctionArgs) => {
  const folder = new Promise((res) =>
    serverLoader().then((data) =>
      res((data as SerializeFrom<typeof loader>).folder)
    )
  )

  return { folder }
}

export const headers: HeadersFunction = ({ loaderHeaders, parentHeaders }) => {
  return {
    'Server-Timing': combineServerTimings(parentHeaders, loaderHeaders),
  }
}

export const shouldRevalidate: ShouldRevalidateFunction = ({ formAction }) => {
  if (formAction) {
    return true
  }

  return false
}

const ProjectHeader: React.FC<{
  project: ProjectWithFolders | null
}> = ({ project }) => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { folderId } = useParams()
  const currentFolder = project?.folders.find((e) => e.id === folderId)
  const projectTotalSize = formatBytes(Number(project?.totalSize) || 0)

  const handleCreateFolder = async () => {}

  const handleFolderClick = (folder: Folder) => {
    if (!project) return

    if (currentFolder?.id !== folder.id) {
      navigate('/projects/' + project.url + '/folder/' + folder.id)
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
            <IconButton
              // disabled={isCreatingFolder}
              // loading={isCreatingFolder}
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
            <Animated>{projectTotalSize}</Animated>
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
    </>
  )
}

const FolderComponent: React.FC<{
  folder: FolderWithFiles | null
}> = ({ folder }) => {
  const storeFiles = useProjectsStore((state) => state.files)
  const setFilesToStore = useProjectsStore((state) => state.setFiles)
  const files = storeFiles || folder?.files

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
      <Suspense>
        <Await resolve={data.folder}>
          {(folder) => <FolderComponent folder={folder} />}
        </Await>
      </Suspense>
    </div>
  )
}

export const ErrorBoundary = GeneralErrorBoundary

export default ProjectRoute
