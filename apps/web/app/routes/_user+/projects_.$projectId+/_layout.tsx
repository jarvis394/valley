import React, { useEffect } from 'react'
import {
  ClientLoaderFunction,
  data,
  Outlet,
  redirect,
  ShouldRevalidateFunction,
} from 'react-router'
import ProjectToolbar from 'app/components/Toolbar/ProjectToolbar'
import { GeneralErrorBoundary } from 'app/components/ErrorBoundary'
import { HeadersFunction, LoaderFunctionArgs } from 'react-router'
import {
  getUserIdFromSession,
  requireLoggedIn,
} from 'app/server/auth/auth.server'
import {
  combineServerTimings,
  makeTimings,
  time,
} from 'app/server/timing.server'
import {
  cacheClientLoader,
  decacheClientLoader,
  invalidateCache,
  useCachedLoaderData,
} from 'app/utils/cache'
import type { Folder, Project } from '@valley/db'
import { invariantResponse } from 'app/utils/invariant'
import { getUserProject } from 'app/server/project/project.server'
import { useProjectsStore } from 'app/stores/projects'
import { FolderWithFiles } from '@valley/shared'

export const getProjectCacheKey = (id?: Project['id']) => `project:${id}`

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireLoggedIn(request)

  const { projectId } = params
  invariantResponse(projectId, 'Missing project ID in route params')

  const timings = makeTimings('project loader')
  const userId = await time(getUserIdFromSession(request), {
    timings,
    type: 'project get userId from session',
  })

  if (!userId) {
    return redirect('/auth/login')
  }

  const project = await time(getUserProject({ userId, projectId }), {
    timings,
    type: 'get project',
  })

  return data({ project }, { headers: { 'Server-Timing': timings.toString() } })
}

export const clientLoader: ClientLoaderFunction = ({ params, ...props }) => {
  if (!params.projectId) {
    return redirect('/projects')
  }

  return cacheClientLoader(
    { params, ...props },
    {
      type: 'swr',
      key: getProjectCacheKey(params.projectId),
    }
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

export const headers: HeadersFunction = ({ loaderHeaders, parentHeaders }) => {
  return {
    'Server-Timing': combineServerTimings(parentHeaders, loaderHeaders),
  }
}

const ProjectLayout: React.FC = () => {
  const setProject = useProjectsStore((state) => state.setProject)
  const data = useCachedLoaderData<typeof loader>()

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
