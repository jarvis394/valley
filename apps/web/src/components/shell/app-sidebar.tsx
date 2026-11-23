import { Link, useNavigate } from '@tanstack/react-router'
import {
  AnalyticsIcon,
  Badge,
  EyeIcon,
  ListItemMeta,
  Menu,
  PortfolioIcon,
  ProjectsIcon,
  SettingsIcon,
} from '@valley/ui'
import { LogOut, ShieldCheck } from 'lucide-react'
import { APP_VERSION, REPOSITORY_URL } from '../../config/constants'
import type { Account, ProjectSummary } from '../../data/api'
import { formatCompact } from '../../lib/format'
import { Sidebar } from './sidebar'

export function AppSidebar({
  account,
  projects,
  collapsed,
  pendingUsersCount = 0,
  onSignOut,
}: {
  account: Account
  projects: ProjectSummary[]
  collapsed: boolean
  pendingUsersCount?: number
  onSignOut: () => void
}) {
  const navigate = useNavigate()

  return (
    <Sidebar.Root collapsed={collapsed}>
      <Sidebar.Account
        name={account.name}
        avatar={account.avatar}
        render={<Link to="/projects" />}
        menu={
          <>
            <Menu.Label title={account.name} description={account.email} />
            <Menu.Separator />
            <Menu.Item icon={<SettingsIcon />} render={<Link to="/settings" />}>
              Settings
            </Menu.Item>
            {account.isAdmin && (
              <Menu.Item
                icon={<ShieldCheck className="size-4" />}
                render={<Link to="/admin/users" />}
              >
                <span className="min-w-0 flex-1">Manage users</span>
                {pendingUsersCount > 0 && <Badge>{pendingUsersCount}</Badge>}
              </Menu.Item>
            )}
            <Menu.Separator />
            <Menu.Item variant="danger" icon={<LogOut className="size-4" />} onClick={onSignOut}>
              Sign out
            </Menu.Item>
          </>
        }
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
        <Sidebar.NavItem icon={SettingsIcon} label="Settings" render={<Link to="/settings" />} />
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
