import React, { useEffect } from 'react'
import { data, Outlet, redirect, ShouldRevalidateFunction } from 'react-router'
import ProjectToolbar from 'app/components/Toolbar/ProjectToolbar'
import { GeneralErrorBoundary } from 'app/components/ErrorBoundary'
import {
  combineServerTimings,
  makeTimings,
  time,
} from 'app/server/timing.server'
import {
  cacheClientLoader,
  decacheClientLoader,
  invalidateCache,
  useCachedData,
} from 'app/utils/cache'
import type { Folder } from '@valley/db'
import { getUserProject } from 'app/server/services/project.server'
import { useProjectsStore } from 'app/stores/projects'
import { FolderWithFiles } from '@valley/shared'
import { requireUserId } from 'app/server/auth/auth.server'
import { Route } from './+types/_layout'
import { getProjectCacheKey } from 'app/utils/project'

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { projectId } = params
  const timings = makeTimings('project loader')
  const userId = await requireUserId(request)
  const project = await time(getUserProject({ userId, projectId }), {
    timings,
    type: 'get project',
  })

  if (!project) {
    return redirect('/projects')
  }

  return data({ project }, { headers: { 'Server-Timing': timings.toString() } })
}

export const clientLoader = async ({
  params,
  ...props
}: Route.ClientLoaderArgs) => {
  if (!params.projectId) {
    return redirect('/projects')
  }

  return cacheClientLoader(
    { params, ...props },
    { type: 'swr', key: getProjectCacheKey(params.projectId) }
  )
}

clientLoader.hydrate = true

export const clientAction = decacheClientLoader

export const shouldRevalidate: ShouldRevalidateFunction = ({
  formAction,
  currentParams,
}) => {
  if (formAction && currentParams.projectId) {
    invalidateCache(getProjectCacheKey(currentParams.projectId))
    return true
  }

  return false
}

export const headers = ({
  loaderHeaders,
  parentHeaders,
}: Route.HeadersArgs) => {
  return { 'Server-Timing': combineServerTimings(parentHeaders, loaderHeaders) }
}

const ProjectLayout: React.FC<Route.ComponentProps> = ({ loaderData }) => {
  const setProject = useProjectsStore((state) => state.setProject)
  const data = useCachedData({ data: loaderData })

  // Set the project to the cache store when the data is loaded
  // Used for optimistic updates
  useEffect(() => {
    if (!data.project) return
    const folders: Record<Folder['id'], FolderWithFiles> = {}
    data.project.folders.forEach((folder) => {
      folders[folder.id] = { ...folder, files: [] }
    })
    setProject({ ...data.project, folders })
  }, [data.project, setProject])

  return (
    <>
      <ProjectToolbar />
      <Outlet />
    </>
  )
}

export const ErrorBoundary = GeneralErrorBoundary

export default React.memo(ProjectLayout)
