'use client'
import React from 'react'
import styles from './Toolbar.module.css'
import TabsItem from '@valley/ui/TabsItem'
import AnimatedTabs from '../AnimatedTabs/AnimatedTabs'

const ProjectsToolbar = () => {
  return (
    <div className={styles.toolbar}>
      <AnimatedTabs defaultValue={0}>
        <TabsItem value={0}>Projects</TabsItem>
        <TabsItem value={1}>Profile</TabsItem>
        <TabsItem value={2}>Analytics</TabsItem>
        <TabsItem value={3}>Settings</TabsItem>
      </AnimatedTabs>
    </div>
  )
}

export default ProjectsToolbar
