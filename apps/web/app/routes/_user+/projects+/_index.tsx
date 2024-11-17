import type { HeadersFunction, LoaderFunctionArgs } from '@remix-run/node'
import { Await, data, Link, useLoaderData } from '@remix-run/react'
import Button from '@valley/ui/Button'
import Stack from '@valley/ui/Stack'
import Wrapper from '@valley/ui/Wrapper'
import { showToast } from 'app/components/Toast/Toast'
import { getUserIdFromSession } from 'app/server/auth/auth.server'
import { prisma } from 'app/server/db.server'
import React, { Suspense } from 'react'
import styles from './projects.module.css'
import ProjectCard from 'app/components/ProjectCard/ProjectCard'
import { GeneralErrorBoundary } from 'app/components/ErrorBoundary'
import {
  combineServerTimings,
  makeTimings,
  time,
} from 'app/server/timing.server'
import ProjectCardSkeleton from 'app/components/svg/ProjectCardSkeleton'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const timings = makeTimings('projects loader')
  const userId = await time(getUserIdFromSession(request), {
    timings,
    type: 'get userId from session',
  })
  const projects = time(
    prisma.project.findMany({
      where: { userId },
    }),
    { timings, type: 'find projects' }
  )

  return data(
    { projects },
    { headers: { 'Server-Timing': timings.toString() } }
  )
}

export const headers: HeadersFunction = ({ loaderHeaders, parentHeaders }) => {
  return {
    'Server-Timing': combineServerTimings(parentHeaders, loaderHeaders),
  }
}

const ProjectsRoute = () => {
  const data = useLoaderData<typeof loader>()

  return (
    <Stack direction={'column'} gap={4} padding={4}>
      <Button asChild>
        <Link to="/account/settings">/account/settings</Link>
      </Button>
      <Button asChild>
        <Link to={{ search: 'modal=create-project' }}>Create Project</Link>
      </Button>
      <Button
        variant="secondary-dimmed"
        onClick={() =>
          showToast({
            title: 'Test title',
            description: 'Test description, very long',
            type: 'info',
            id: 'test',
          })
        }
      >
        Show toast
      </Button>
      <Wrapper>
        <div className={styles.projects__list}>
          <Suspense
            fallback={[1, 2, 3, 4, 5, 6].map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          >
            <Await resolve={data.projects}>
              {(projects) =>
                projects?.map((project, i) => (
                  <ProjectCard data={project} key={i} />
                ))
              }
            </Await>
          </Suspense>
        </div>
      </Wrapper>
    </Stack>
  )
}

export const ErrorBoundary = GeneralErrorBoundary

export default ProjectsRoute
