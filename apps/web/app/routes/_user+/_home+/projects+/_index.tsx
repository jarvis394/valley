import { redirect, data, Link, ShouldRevalidateFunction } from 'react-router'
import Button from '@valley/ui/Button'
import Stack from '@valley/ui/Stack'
import Wrapper from '@valley/ui/Wrapper'
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
import { cache, createClientLoaderCache, useCachedData } from 'app/utils/cache'
import Menu from '@valley/ui/Menu'
import { getUserProjects } from 'app/server/services/project.server'
import { useHydrated } from 'remix-utils/use-hydrated'
import { auth } from '@valley/auth'
import { Route } from './+types/_index'
import { getProjectsCacheKey } from 'app/utils/project'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const session = await auth.api.getSession({ headers: request.headers })
  const timings = makeTimings('projects loader')

  if (!session) {
    return redirect('/auth/login')
  }

  const projects = await time(getUserProjects({ userId: session.user.id }), {
    timings,
    type: 'find projects',
  })

  return data(
    { projects },
    { headers: { 'Server-Timing': timings.toString() } }
  )
}

export const headers = ({
  loaderHeaders,
  parentHeaders,
}: Route.HeadersArgs) => {
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

export const clientLoader = createClientLoaderCache<Route.ClientLoaderArgs>({
  key: getProjectsCacheKey(),
  type: 'swr',
})

const projectSkeletons = (
  <div className={styles.projects__placeholderIllustration}>
    <Wrapper className={styles.projects__list}>
      {new Array(8).fill(null).map((_, i) => (
        <ProjectCard loading key={i} />
      ))}
    </Wrapper>
  </div>
)

const ProjectsList: React.FC<{ projects?: ProjectWithFolders[] }> = ({
  projects,
}) => {
  const isHydrated = useHydrated()

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
        {isHydrated && (
          <Stack
            className="fade-in"
            direction={'column'}
            gap={4}
            align={'center'}
            justify={'center'}
          >
            <h1>This page seems empty</h1>
            <p>Upload some photos to make it happier</p>
          </Stack>
        )}
        {isHydrated && (
          <Button
            asChild
            className="fade-in"
            variant="primary"
            size="lg"
            before={<Plus />}
          >
            <Link preventScrollReset to={{ search: 'modal=create-project' }}>
              Create project
            </Link>
          </Button>
        )}
        {projectSkeletons}
      </Stack>
    )
  }

  return (
    <Wrapper className={styles.projects__list}>
      {projects?.map((project, i) => <ProjectCard project={project} key={i} />)}
    </Wrapper>
  )
}

const ProjectsRoute: React.FC<Route.ComponentProps> = ({ loaderData }) => {
  const data = useCachedData({ data: loaderData })

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
      <ProjectsList projects={data.projects} />
    </Stack>
  )
}

export const ErrorBoundary = GeneralErrorBoundary

export default ProjectsRoute
