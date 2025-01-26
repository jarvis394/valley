import type { HeadersFunction, LoaderFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { data, Link, ShouldRevalidateFunction } from '@remix-run/react'
import Button from '@valley/ui/Button'
import Stack from '@valley/ui/Stack'
import Wrapper from '@valley/ui/Wrapper'
import {
  getUserIdFromSession,
  requireLoggedIn,
} from 'app/server/auth/auth.server'
import React from 'react'
import styles from './projects.module.css'
import ProjectCard from 'app/components/ProjectCard/ProjectCard'
import { GeneralErrorBoundary } from 'app/components/ErrorBoundary'
import {
  combineServerTimings,
  makeTimings,
  time,
} from 'app/server/timing.server'
import Input from '@valley/ui/Input'
import {
  ChevronDown,
  MagnifyingGlass,
  Plus,
  SortAscending,
  SortDescending,
} from 'geist-ui-icons'
import CreateProjectButton from 'app/components/BannerBlocks/CreateProjectButton'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import { ProjectWithFolders } from '@valley/shared'
import {
  cache,
  createClientLoaderCache,
  useCachedLoaderData,
  useSwrData,
} from 'app/utils/cache'
import Menu from '@valley/ui/Menu'
import { getUserProjects } from 'app/server/project/project.server'

export const getProjectsCacheKey = () => 'projects'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireLoggedIn(request)

  const timings = makeTimings('projects loader')
  const userId = await time(getUserIdFromSession(request), {
    timings,
    type: 'get userId from session',
  })

  if (!userId) {
    throw redirect('/auth/login')
  }

  const projects = await time(getUserProjects({ userId }), {
    timings,
    type: 'find projects',
  })

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
    cache.removeItem(getProjectsCacheKey())
    return true
  }

  return false
}

export const clientLoader = createClientLoaderCache({
  key: getProjectsCacheKey(),
  type: 'swr',
})

const projectSkeletons = (
  <Wrapper className={styles.projects__list}>
    {new Array(8).fill(null).map((_, i) => (
      <ProjectCard loading key={i} />
    ))}
  </Wrapper>
)

const ProjectsList: React.FC<{ projects?: ProjectWithFolders[] }> = ({
  projects,
}) => {
  if (projects?.length === 0) {
    return (
      <Stack
        fullHeight
        fullWidth
        direction={'column'}
        gap={6}
        align={'center'}
        justify={'center'}
        className={styles.projects__placeholder}
        padding={8}
      >
        <Stack direction={'column'} gap={4} align={'center'} justify={'center'}>
          <h1>This page seems empty</h1>
          <p>Upload some photos to make it happier</p>
        </Stack>
        <Button asChild variant="primary" size="lg" before={<Plus />}>
          <Link preventScrollReset to={{ search: 'modal=create-project' }}>
            Create project
          </Link>
        </Button>
        <div className={styles.projects__placeholderIllustration}>
          {projectSkeletons}
        </div>
      </Stack>
    )
  }

  return (
    <Wrapper className={styles.projects__list}>
      {projects?.map((project, i) => <ProjectCard project={project} key={i} />)}
    </Wrapper>
  )
}

const ProjectsRoute = () => {
  const data = useCachedLoaderData<typeof loader>()
  const ProjectsAwait = useSwrData<typeof loader>(data)

  return (
    <Stack direction={'column'} fullHeight fullWidth>
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
          <Menu.Root>
            <Menu.Trigger asChild>
              <Button
                size="md"
                variant="secondary-dimmed"
                before={<SortAscending />}
                after={<ChevronDown />}
              >
                Sort by name
              </Button>
            </Menu.Trigger>
            <Menu.Content>
              <Menu.Item
                after={<SortAscending color="var(--text-secondary)" />}
              >
                Sort by name
              </Menu.Item>
              <Menu.Item
                after={<SortDescending color="var(--text-secondary)" />}
              >
                Sort by name
              </Menu.Item>
              <Menu.Item
                after={<SortAscending color="var(--text-secondary)" />}
              >
                Sort by date updated
              </Menu.Item>
              <Menu.Item
                after={<SortDescending color="var(--text-secondary)" />}
              >
                Sort by date updated
              </Menu.Item>
              <Menu.Item
                after={<SortAscending color="var(--text-secondary)" />}
              >
                Sort by date shot
              </Menu.Item>
              <Menu.Item
                after={<SortDescending color="var(--text-secondary)" />}
              >
                Sort by date shot
              </Menu.Item>
            </Menu.Content>
          </Menu.Root>
        </Stack>
      </Wrapper>
      <ProjectsAwait fallback={() => projectSkeletons}>
        {(data) => <ProjectsList projects={data.projects} />}
      </ProjectsAwait>
    </Stack>
  )
}

export const ErrorBoundary = GeneralErrorBoundary

export default ProjectsRoute
