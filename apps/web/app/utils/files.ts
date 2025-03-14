import { loader as folderLoader } from 'app/routes/_user+/projects_.$projectId+/folder.$folderId'
import { useCachedRouteLoaderData } from './cache'
import { useProjectsStore } from 'app/stores/projects'
import { useParams } from '@remix-run/react'

export function useFiles() {
  const folderData = useCachedRouteLoaderData<typeof folderLoader>({
    route: 'routes/_user+/projects_.$projectId+/folder.$folderId',
  })
  const { projectId, folderId } = useParams()
  const storeFiles = useProjectsStore(
    (state) => state.projects[projectId || ''].folders[folderId || ''].files
  )

  return storeFiles || folderData?.data || []
}
