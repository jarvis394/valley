'use client'
import React from 'react'
import styles from './Toolbar.module.css'
import TabsItem from '@valley/ui/TabsItem'
import AnimatedTabs from '../AnimatedTabs/AnimatedTabs'

const ProjectToolbar = () => {
  return (
    <div className={styles.toolbar}>
      <AnimatedTabs defaultValue={0}>
        <TabsItem value={0}>Overview</TabsItem>
        <TabsItem value={1}>Settings</TabsItem>
        <TabsItem value={2}>Design</TabsItem>
      </AnimatedTabs>
    </div>
  )
}

export default ProjectToolbar
