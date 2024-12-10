import type {
  HeadersFunction,
  LoaderFunctionArgs,
  SerializeFrom,
} from '@remix-run/cloudflare'
import {
  Await,
  ClientLoaderFunctionArgs,
  data,
  ShouldRevalidateFunction,
  useLoaderData,
} from '@remix-run/react'
import Button from '@valley/ui/Button'
import Stack from '@valley/ui/Stack'
import Wrapper from '@valley/ui/Wrapper'
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
import Input from '@valley/ui/Input'
import { ChevronDown, MagnifyingGlass, SortAscending } from 'geist-ui-icons'
import CreateProjectButton from 'app/components/BannerBlocks/CreateProjectButton'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const timings = makeTimings('projects loader')
  const userId = await time(getUserIdFromSession(request), {
    timings,
    type: 'get userId from session',
  })
  const projects = time(
    prisma.project.findMany({
      where: { userId },
      orderBy: { dateCreated: 'desc' },
      include: {
        folders: true,
      },
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

export const shouldRevalidate: ShouldRevalidateFunction = ({ formAction }) => {
  if (formAction) {
    return true
  }

  return false
}

export const clientLoader = ({ serverLoader }: ClientLoaderFunctionArgs) => {
  const projects = new Promise((res) =>
    serverLoader().then((data) =>
      res((data as SerializeFrom<typeof loader>).projects)
    )
  )

  return { projects }
}

const projectSkeletons = new Array(8)
  .fill(null)
  .map((_, i) => <ProjectCard loading key={i} />)

const ProjectsRoute = () => {
  const data = useLoaderData<typeof loader>()

  return (
    <Stack direction={'column'}>
      <Wrapper asChild className={styles.projects__bannerBlocks}>
        <OverlayScrollbarsComponent
          defer
          options={{
            scrollbars: { theme: 'os-theme-light' },
            overflow: { x: 'scroll' },
          }}
          style={{ gap: 12 }}
        >
          <CreateProjectButton />
        </OverlayScrollbarsComponent>
      </Wrapper>
      <Wrapper className={styles.projects__searchBar} asChild>
        <Stack gap={3}>
          <Input
            placeholder="Search projects..."
            paperProps={{ className: styles.projects__searchInput }}
            before={<MagnifyingGlass color="var(--text-hint)" />}
          />
          <Button
            size="md"
            variant="secondary-dimmed"
            before={<SortAscending />}
            after={<ChevronDown />}
          >
            Sort by name
          </Button>
        </Stack>
      </Wrapper>
      <Wrapper className={styles.projects__list}>
        <Suspense fallback={projectSkeletons}>
          <Await resolve={data.projects}>
            {(projects) =>
              projects?.map((project, i) => (
                <ProjectCard project={project} key={i} />
              ))
            }
          </Await>
        </Suspense>
      </Wrapper>
    </Stack>
  )
}

export const ErrorBoundary = GeneralErrorBoundary

export default ProjectsRoute
