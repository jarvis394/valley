import { Link, useNavigate } from '@tanstack/react-router'
import {
  AnalyticsIcon,
  EyeIcon,
  ListItemMeta,
  Menu,
  PortfolioIcon,
  ProjectsIcon,
  SettingsIcon,
} from '@valley/ui'
import { APP_VERSION, REPOSITORY_URL } from '../../config/constants'
import type { Account, ProjectSummary } from '../../data/api'
import { formatCompact } from '../../lib/format'
import { Sidebar } from './sidebar'

export function AppSidebar({
  account,
  projects,
  collapsed,
}: {
  account: Account
  projects: ProjectSummary[]
  collapsed: boolean
}) {
  const navigate = useNavigate()
  return (
    <Sidebar.Root collapsed={collapsed}>
      <Sidebar.Account
        name={account.name}
        avatar={account.avatar}
        render={<Link to="/projects" />}
        menu={<Menu.Item disabled>{account.name}</Menu.Item>}
      />
      <Sidebar.Nav>
        <Sidebar.NavItem
          icon={ProjectsIcon}
          label="Projects"
          render={<Link to="/projects" activeOptions={{ exact: true }} />}
        />
        <Sidebar.NavItem icon={PortfolioIcon} label="Portfolio" />
        <Sidebar.NavItem
          icon={AnalyticsIcon}
          label="Analytics"
          end={
            <ListItemMeta>
              {formatCompact(account.views)}
              <EyeIcon opacity={0.3} />
            </ListItemMeta>
          }
        />
        <Sidebar.NavItem icon={SettingsIcon} label="Settings" />
      </Sidebar.Nav>
      <Sidebar.Projects
        title="Recent"
        action={
          <Sidebar.ProjectsMore
            label="All projects"
            onClick={() => void navigate({ to: '/projects' })}
          />
        }
      >
        {projects.map((project) => (
          <Sidebar.ProjectItem
            key={project.id}
            label={project.title}
            thumbnail={project.thumbnail}
            render={<Link to="/projects/$projectId" params={{ projectId: project.id }} />}
          />
        ))}
      </Sidebar.Projects>
      <Sidebar.Footer version={APP_VERSION} repositoryUrl={REPOSITORY_URL} />
    </Sidebar.Root>
  )
}
