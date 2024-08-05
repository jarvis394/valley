import React from 'react'
import styles from './Toolbar.module.css'
import Tabs from '@valley/ui/Tabs'
import TabsItem from '@valley/ui/TabsItem'

const Toolbar = () => {
  return (
    <div className={styles.toolbar}>
      <Tabs defaultValue={0}>
        <TabsItem value={0}>Projects</TabsItem>
        <TabsItem value={1}>Profile</TabsItem>
        <TabsItem value={2}>Analytics</TabsItem>
        <TabsItem value={3}>Settings</TabsItem>
      </Tabs>
    </div>
  )
}

export default Toolbar
