import React from 'react'
import {
  ClientLoaderFunction,
  data,
  Outlet,
  redirect,
  ShouldRevalidateFunction,
} from '@remix-run/react'
import ProjectToolbar from 'app/components/Toolbar/ProjectToolbar'
import { GeneralErrorBoundary } from 'app/components/ErrorBoundary'
import { HeadersFunction, LoaderFunctionArgs } from '@remix-run/node'
import {
  getUserIdFromSession,
  requireLoggedIn,
} from 'app/server/auth/auth.server'
import { prisma } from 'app/server/db.server'
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
} from 'app/utils/client-cache'
import type { Project } from '@valley/db'
import { invariantResponse } from 'app/utils/invariant'

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

  const project = await time(
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

export const clientLoader: ClientLoaderFunction = ({ params, ...props }) => {
  if (!params.projectId) {
    return redirect('/projects')
  }

  return cacheClientLoader(
    { params, ...props },
    {
      key: getProjectCacheKey(params.projectId),
    }
  )
}

clientLoader.hydrate = true

export const clientAction = decacheClientLoader

export const shouldRevalidate: ShouldRevalidateFunction = ({
  formAction,
  currentParams,
  currentUrl,
  nextUrl,
}) => {
  if (formAction && currentParams.projectId) {
    invalidateCache(getProjectCacheKey(currentParams.projectId))
    return true
  }

  if (
    !currentUrl.searchParams.has('upload') &&
    nextUrl.searchParams.has('upload')
  ) {
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
  useCachedLoaderData()

  return (
    <>
      <ProjectToolbar />
      <Outlet />
    </>
  )
}

export const ErrorBoundary = GeneralErrorBoundary

export default React.memo(ProjectLayout)
