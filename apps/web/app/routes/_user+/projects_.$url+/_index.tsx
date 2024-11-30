import React, { Suspense } from 'react'
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
import { data, HeadersFunction, LoaderFunctionArgs } from '@remix-run/node'
import { prisma } from 'app/server/db.server'
import {
  combineServerTimings,
  makeTimings,
  time,
} from 'app/server/timing.server'
import { getUserIdFromSession } from 'app/server/auth/auth.server'
import { Await, useLoaderData } from '@remix-run/react'
import FileCard from 'app/components/FileCard/FileCard'
import UploadButton from 'app/components/UploadButton/UploadButton'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { url } = params
  const timings = makeTimings('project loader')
  const userId = await time(getUserIdFromSession(request), {
    timings,
    type: 'get userId from session',
  })
  const project = time(
    prisma.project.findFirst({
      where: { url },
      include: {
        folders: true,
      },
    }),
    { timings, type: 'get project' }
  )
  const folder = time(
    prisma.folder.findFirst({
      where: {
        Project: {
          url,
          userId,
        },
        isDefaultFolder: true,
      },
      include: {
        files: true,
      },
    }),
    { timings, type: 'get folder' }
  )

  return data(
    { project, folder },
    { headers: { 'Server-Timing': timings.toString() } }
  )
}

export const headers: HeadersFunction = ({ loaderHeaders, parentHeaders }) => {
  return {
    'Server-Timing': combineServerTimings(parentHeaders, loaderHeaders),
  }
}

export const shouldRevalidate = () => {
  return true
}

const ProjectRoute = () => {
  const data = useLoaderData<typeof loader>()

  // const { url } = useParams()
  // const searchParams = useSearchParams()
  // const router = useRouter()
  // const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  // const folderId = searchParams.get('folder')
  // const parsedFolderId = folderId ? Number(folderId) : data?.folders[0]?.id
  // const currentFolder = useMemo(
  //   () => data?.folders.find((e) => e.id === parsedFolderId),
  //   [data?.folders, parsedFolderId]
  // )
  // const projectTotalSize = data && formatBytes(data?.project.totalSize)

  const handleCreateFolder = async () => {}

  // const handleFolderClick = (folder: SerializedFolder) => {
  //   if (currentFolder?.id !== folder.id) {
  //     router.push(`/projects/${id}?folder=${folder.id}`)
  //   }
  // }

  // const handleEditFolderTitle = () => {
  //   if (!currentFolder) return
  //   const params = new URLSearchParams(searchParams.toString())
  //   params.set('folder', currentFolder.id.toString())
  //   params.set('modal', 'edit-folder-title')
  //   params.set('modal-folderId', currentFolder.id.toString())
  //   router.push(`/projects/${id}?${params.toString()}`)
  // }

  // const handleEditFolderDescription = () => {
  //   if (!currentFolder) return
  //   const params = new URLSearchParams(searchParams.toString())
  //   params.set('folder', currentFolder.id.toString())
  //   params.set('modal', 'edit-folder-description')
  //   params.set('modal-folderId', currentFolder.id.toString())
  //   router.push(`/projects/${id}?${params.toString()}`)
  // }

  return (
    <div className={styles.project}>
      <Suspense fallback={<h1>loading project...</h1>}>
        <Await resolve={data.project}>
          {(project) => (
            <>
              <PageHeader
                before={
                  <>
                    <Button size="lg" variant="secondary" before={<Share />}>
                      Share project
                    </Button>
                    <Button
                      // onClick={handleEditFolderDescription}
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
                      <FolderCard key={i} folder={folder} />
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
                    {formatBytes(Number(project?.totalSize || 0))}
                  </div>
                </Wrapper>
              </div>
              <Divider />
              <Wrapper className={styles.project__folderInfo}>
                {/* {currentFolder?.title && (
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
                )} */}
              </Wrapper>
            </>
          )}
        </Await>
      </Suspense>
      <Suspense>
        <Await resolve={data.folder}>
          {(folder) => (
            <Wrapper className={styles.project__files}>
              {folder && (
                <UploadButton
                  projectId={folder.projectId}
                  folderId={folder.id}
                />
              )}
              {folder?.files.map((file, i) => (
                // TODO: investigate `key`, somewhy `key={file.id}` throws React error of 2 duplicate keys
                // TODO: `key={i}` is a quick fix
                <FileCard key={i} file={file} />
              ))}
            </Wrapper>
          )}
        </Await>
      </Suspense>
    </div>
  )
}

export const ErrorBoundary = GeneralErrorBoundary

export default ProjectRoute
