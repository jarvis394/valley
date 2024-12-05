import { useRouteLoaderData } from '@remix-run/react'
import { loader as projectLayoutLoader } from 'app/routes/_user+/projects_.$url+/_layout'

export function useProjectAwait() {
  const projectData = useRouteLoaderData<typeof projectLayoutLoader>(
    'routes/_user+/projects_.$url+/_layout'
  )

  return projectData || null
}