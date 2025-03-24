import { useCachedRouteLoaderData } from './cache'
import { useProjectsStore } from 'app/stores/projects'
import { useParams } from 'react-router'
import { Route } from '../routes/_user+/projects_.$projectId+/folder.$folderId/+types'

export function useFiles() {
  const folderData = useCachedRouteLoaderData<
    Route.ComponentProps['loaderData']
  >({
    route: 'routes/_user+/projects_.$projectId+/folder.$folderId',
  })
  const { projectId, folderId } = useParams()
  const storeFiles = useProjectsStore(
    (state) => state.projects[projectId || '']?.folders?.[folderId || '']?.files
  )

  return storeFiles || folderData?.data || []
}
