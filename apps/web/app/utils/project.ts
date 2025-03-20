import { useCachedRouteLoaderData } from './cache'
import { useParams } from 'react-router'
import { useProjectsStore } from 'app/stores/projects'
import { ProjectWithFolders } from '@valley/shared'
import { useMemo } from 'react'
import { Route } from '../routes/_user+/projects_.$projectId+/+types/_layout'

export function useProject(propsProject?: ProjectWithFolders) {
  const { project } = useCachedRouteLoaderData<
    Route.ComponentProps['loaderData']
  >({
    route: 'routes/_user+/projects_.$projectId+/_layout',
  })
  const { projectId } = useParams()
  const storeProject = useProjectsStore(
    (state) => state.projects[projectId || '']
  )
  const parsedStoreProject = useMemo(() => {
    const res: ProjectWithFolders = {
      ...storeProject,
      folders: [],
    }
    if (!storeProject) return propsProject || project
    for (const id in storeProject.folders) {
      const folder = storeProject.folders[id]
      folder && res.folders.push(folder)
    }
    return res
  }, [project, propsProject, storeProject])

  return parsedStoreProject
}
