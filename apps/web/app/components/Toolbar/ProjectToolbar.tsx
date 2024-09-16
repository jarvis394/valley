'use client'
import React from 'react'
import styles from './Toolbar.module.css'
import TabsItem from '@valley/ui/TabsItem'
import AnimatedTabs from '../AnimatedTabs/AnimatedTabs'
import { useParams, useRouter } from 'next/navigation'

const ProjectToolbar = () => {
  const router = useRouter()
  const { id: projectId } = useParams()
  const handleItemClick = (item: string | number) => {
    router.push(`/projects/${projectId}${item}`)
  }

  return (
    <div className={styles.toolbar}>
      <AnimatedTabs onItemClick={handleItemClick} defaultValue={'/'}>
        <TabsItem value={'/'}>Overview</TabsItem>
        <TabsItem value={'/settings'}>Settings</TabsItem>
        <TabsItem value={'/design'}>Design</TabsItem>
      </AnimatedTabs>
    </div>
  )
}

export default ProjectToolbar
