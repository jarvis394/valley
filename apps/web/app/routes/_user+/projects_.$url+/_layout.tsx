import React from 'react'
import { ClientLoaderFunctionArgs, data, Outlet } from '@remix-run/react'
import ProjectToolbar from 'app/components/Toolbar/ProjectToolbar'
import { GeneralErrorBoundary } from 'app/components/ErrorBoundary'
import { LoaderFunctionArgs, SerializeFrom } from '@remix-run/node'
import { getUserIdFromSession } from 'app/server/auth/auth.server'
import { prisma } from 'app/server/db.server'
import { makeTimings, time } from 'app/server/timing.server'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { url } = params
  const timings = makeTimings('project loader')
  const userId = await time(getUserIdFromSession(request), {
    timings,
    type: 'get userId from session',
  })

  const project = time(
    prisma.project.findFirst({
      where: { url, userId },
      include: {
        folders: true,
      },
    }),
    { timings, type: 'get project' }
  )

  return data({ project }, { headers: { 'Server-Timing': timings.toString() } })
}

export const clientLoader = ({ serverLoader }: ClientLoaderFunctionArgs) => {
  const project = new Promise((res) =>
    serverLoader().then((data) =>
      res((data as SerializeFrom<typeof loader>).project)
    )
  )

  return { project }
}

export const shouldRevalidate = () => {
  return false
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

export default ProjectLayout
