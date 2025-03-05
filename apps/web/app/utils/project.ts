import { loader as projectLayoutLoader } from 'app/routes/_user+/projects_.$projectId+/_layout'
import { useCachedLoaderData } from './cache'
import { useParams, useRouteLoaderData } from '@remix-run/react'
import { useProjectsStore } from 'app/stores/projects'
import { ProjectWithFolders } from '@valley/shared'
import { useMemo } from 'react'

export function useProjectAwait() {
  const data = useRouteLoaderData<typeof projectLayoutLoader>(
    'routes/_user+/projects_.$projectId+/_layout'
  )
  const projectData = useCachedLoaderData<typeof projectLayoutLoader>({ data })

  return projectData
}

export function useProject(propsProject?: ProjectWithFolders) {
  const { project } = useProjectAwait()
  const { projectId } = useParams()
  const storeProject = useProjectsStore(
    (state) => state.projects[projectId || '']
  )
  const parsedStoreProject = useMemo(() => {
    const res: ProjectWithFolders = { ...storeProject, folders: [] }
    if (!storeProject) return propsProject || project
    for (const id in storeProject.folders) {
      const folder = storeProject.folders[id]
      folder && res.folders.push(folder)
    }
    return res
  }, [project, propsProject, storeProject])

  return parsedStoreProject
}
