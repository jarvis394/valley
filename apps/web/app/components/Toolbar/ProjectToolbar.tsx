'use client'
import React from 'react'
import styles from './Toolbar.module.css'
import TabsItem from '@valley/ui/TabsItem'
import AnimatedTabs from '../AnimatedTabs/AnimatedTabs'
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ToolbarItem } from './ToolbarItem'

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

const ProjectToolbar = () => {
  const { id: projectId } = useParams()
  const pathname = usePathname()
  const baseURL = `/projects/${projectId}`
  const defaultValue = pathname.slice(baseURL.length) || '/'

  return (
    <div className={styles.toolbar}>
      <AnimatedTabs defaultValue={defaultValue}>
        {PROJECT_TOOLBAR_ITEMS.map((tab) => (
          <TabsItem asChild key={tab.value} value={tab.value}>
            <Link prefetch href={baseURL + tab.value}>
              {tab.label}
            </Link>
          </TabsItem>
        ))}
      </AnimatedTabs>
    </div>
  )
}

export default ProjectToolbar
