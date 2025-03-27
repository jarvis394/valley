import { invariantResponse } from 'app/utils/invariant'
import { Route } from './+types'
import { auth } from '@valley/auth'
import {
  cacheClientLoader,
  invalidateCache,
  useCachedData,
} from 'app/utils/cache'
import {
  combineServerTimings,
  makeTimings,
  time,
} from 'app/server/timing.server'
import { data, redirect, ShouldRevalidateFunction } from 'react-router'
import { getProjectFolderFiles } from 'app/server/services/folder.server'
import { GeneralErrorBoundary } from 'app/components/ErrorBoundary'
import React from 'react'
import styles from './project.module.css'
import ProjectBlock from './ProjectBlock'
import FolderFiles from './FolderFiles'
import { getFilesCacheKey } from 'app/utils/files'

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { projectId, folderId } = params
  invariantResponse(folderId, 'Missing folder ID in route params')
  invariantResponse(projectId, 'Missing project ID in route params')

  const session = await auth.api.getSession({ headers: request.headers })
  const timings = makeTimings('project folder loader')

  if (!session) {
    return redirect('/auth/login')
  }

  const result = await time(
    getProjectFolderFiles({ userId: session.user.id, projectId, folderId }),
    {
      timings,
      type: 'get folder files',
    }
  )

  return data(
    { data: result },
    { headers: { 'Server-Timing': timings.toString() } }
  )
}

export const clientLoader = ({ params, ...props }: Route.ClientLoaderArgs) => {
  if (!params.folderId) {
    return redirect('/projects')
  }

  return cacheClientLoader<Route.ClientLoaderArgs>(
    { params, ...props },
    { type: 'swr', key: getFilesCacheKey(params.projectId, params.folderId) }
  )
}

clientLoader.hydrate = true

export const headers = ({
  loaderHeaders,
  parentHeaders,
}: Route.HeadersArgs) => {
  return { 'Server-Timing': combineServerTimings(parentHeaders, loaderHeaders) }
}

export const shouldRevalidate: ShouldRevalidateFunction = ({
  formAction,
  currentParams,
  nextParams,
}) => {
  if (formAction && currentParams.folderId) {
    invalidateCache(getFilesCacheKey(currentParams.folderId))
    return true
  }

  if (
    currentParams.folderId &&
    currentParams.folderId !== nextParams.folderId
  ) {
    return true
  }

  return false
}

const ProjectRoute: React.FC<Route.ComponentProps> = ({ loaderData }) => {
  const data = useCachedData({
    data: loaderData,
  })

  return (
    <div className={styles.project}>
      <ProjectBlock />
      <FolderFiles files={data.data} />
    </div>
  )
}

export const ErrorBoundary = GeneralErrorBoundary

export default React.memo(ProjectRoute)
