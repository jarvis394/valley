import React from 'react'
import styles from './Toolbar.module.css'
import TabsItem from '@valley/ui/TabsItem'
import AnimatedTabs from '../AnimatedTabs/AnimatedTabs'
import { ToolbarItem } from './ToolbarItem'
import { Link, useLocation, useParams } from '@remix-run/react'

const PROJECT_TOOLBAR_ITEMS: ToolbarItem[] = [
  {
    label: 'Overview',
    value: '/',
  },
  {
    label: 'Settings',
    value: '/settings',
  },
  {
    label: 'Design',
    value: '/design',
  },
]

const ProjectsToolbar = () => {
  const { url: projectUrl } = useParams()
  const location = useLocation()
  const baseURL = `/projects/${projectUrl}`
  const defaultValue = location.pathname.slice(baseURL.length) || '/'

  return (
    <div className={styles.toolbar}>
      <AnimatedTabs defaultValue={defaultValue}>
        {PROJECT_TOOLBAR_ITEMS.map((tab) => (
          <TabsItem asChild key={tab.value} value={tab.value}>
            <Link prefetch="intent" to={baseURL + tab.value}>
              {tab.label}
            </Link>
          </TabsItem>
        ))}
      </AnimatedTabs>
    </div>
  )
}

export default ProjectsToolbar
