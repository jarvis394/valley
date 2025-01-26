import { loader as projectLayoutLoader } from 'app/routes/_user+/projects_.$projectId+/_layout'
import { useCachedLoaderData, useSwrData } from './cache'
import { useRouteLoaderData } from '@remix-run/react'

export function useProjectAwait() {
  const data = useRouteLoaderData<typeof projectLayoutLoader>(
    'routes/_user+/projects_.$projectId+/_layout'
  )
  const projectData = useCachedLoaderData<typeof projectLayoutLoader>({ data })
  const ProjectAwait = useSwrData<typeof projectLayoutLoader>(projectData || {})

  return { ProjectAwait, projectData }
}
