import { Route } from '../routes/_user+/projects_.$projectId+/+types/_layout'
import { useCachedLoaderData, useSwrData } from './cache'
import { useRouteLoaderData } from 'react-router'

export function useProjectAwait() {
  const data = useRouteLoaderData<Route.ComponentProps['loaderData']>(
    'routes/_user+/projects_.$projectId+/_layout'
  )
  const projectData = useCachedLoaderData<Route.ComponentProps['loaderData']>({
    data,
  })
  const ProjectAwait = useSwrData(projectData || {})

  return { ProjectAwait, projectData }
}
