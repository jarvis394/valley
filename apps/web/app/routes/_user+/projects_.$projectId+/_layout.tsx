import React from 'react'
import {
  ClientLoaderFunctionArgs,
  data,
  Outlet,
  redirect,
  ShouldRevalidateFunction,
} from '@remix-run/react'
import ProjectToolbar from 'app/components/Toolbar/ProjectToolbar'
import { GeneralErrorBoundary } from 'app/components/ErrorBoundary'
import { HeadersFunction, LoaderFunctionArgs } from '@remix-run/cloudflare'
import { getUserIdFromSession } from 'app/server/auth/auth.server'
import { prisma } from 'app/server/db.server'
import {
  combineServerTimings,
  makeTimings,
  time,
} from 'app/server/timing.server'
import { cache } from 'app/utils/client-cache'
import { Project } from '@valley/db'
import { invariantResponse } from 'app/utils/invariant'

export const getProjectCacheKey = (id?: Project['id']) => `project:${id}`

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { projectId } = params
  invariantResponse(projectId, 'Missing project ID in route params')

  const timings = makeTimings('project loader')
  const userId = await time(getUserIdFromSession(request), {
    timings,
    type: 'project get userId from session',
  })

  const project = time(
    () => {
      return prisma.project.findFirst({
        where: { id: projectId, userId },
        include: {
          folders: {
            orderBy: {
              dateCreated: 'asc',
            },
          },
        },
      })
    },
    {
      timings,
      type: 'get project',
    }
  )

  return data({ project }, { headers: { 'Server-Timing': timings.toString() } })
}

let initialLoad = true
export async function clientLoader({
  serverLoader,
  params,
}: ClientLoaderFunctionArgs) {
  if (!params.projectId) {
    return redirect('/projects')
  }

  const key = getProjectCacheKey(params.projectId)
  const cacheEntry = await cache.getItem(key)
  if (cacheEntry && !initialLoad) {
    return { project: cacheEntry, cached: true }
  }

  initialLoad = false

  return await serverLoader()
}

clientLoader.hydrate = true

export const shouldRevalidate: ShouldRevalidateFunction = ({
  formAction,
  currentParams,
  defaultShouldRevalidate,
}) => {
  if (formAction && currentParams.projectId) {
    cache.removeItem(getProjectCacheKey(currentParams.projectId))
    return true
  }

  return defaultShouldRevalidate
}

export const headers: HeadersFunction = ({ loaderHeaders, parentHeaders }) => {
  return {
    'Server-Timing': combineServerTimings(parentHeaders, loaderHeaders),
  }
}

const ProjectLayout: React.FC = () => {
  return (
    <>
      <ProjectToolbar />
      <Outlet />
    </>
  )
}

export const ErrorBoundary = GeneralErrorBoundary

export default React.memo(ProjectLayout)
