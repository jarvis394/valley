import React from 'react'
import styles from './Toolbar.module.css'
import Tabs from '@valley/ui/Tabs'
import TabsItem from '@valley/ui/TabsItem'

const ProjectToolbar = () => {
  return (
    <div className={styles.toolbar}>
      <Tabs defaultValue={0}>
        <TabsItem value={0}>Overview</TabsItem>
        <TabsItem value={1}>Settings</TabsItem>
        <TabsItem value={2}>Design</TabsItem>
      </Tabs>
    </div>
  )
}

export default ProjectToolbar
