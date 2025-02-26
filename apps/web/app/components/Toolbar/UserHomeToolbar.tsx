import React, { useMemo } from 'react'
import styles from './Toolbar.module.css'
import AnimatedTabs from '../AnimatedTabs/AnimatedTabs'
import { ToolbarItem } from './ToolbarItem'
import LinkTabItem from './LinkTabItem'
import { useLocation } from '@remix-run/react'

const userHomeToolbarItems: ToolbarItem[] = [
  {
    label: 'Projects',
    value: '/projects',
  },
  {
    label: 'Profile',
    value: '/account/profile',
  },
  {
    label: 'Analytics',
    value: '/analytics',
  },
  {
    label: 'Settings',
    value: '/settings',
  },
]

const UserHomeToolbar = () => {
  const location = useLocation()
  const value = useMemo(() => {
    if (location.pathname.startsWith('/settings')) {
      return '/settings'
    }

    return location.pathname
  }, [location.pathname])

  return (
    <div className={styles.toolbar}>
      <AnimatedTabs value={value}>
        {userHomeToolbarItems.map((tab, i) => (
          <LinkTabItem key={i} value={tab.value} label={tab.label} />
        ))}
      </AnimatedTabs>
    </div>
  )
}

export default UserHomeToolbar
