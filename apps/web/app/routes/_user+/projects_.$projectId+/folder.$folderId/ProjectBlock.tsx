import Divider from '@valley/ui/Divider'
import React from 'react'
import ProjectHeader from './ProjectHeader'
import ProjectFolders from './ProjectFolders'
import FolderInfo from './FolderInfo'

const ProjectBlock = () => {
  return (
    <>
      <ProjectHeader />
      <Divider />
      <ProjectFolders />
      <Divider />
      <FolderInfo />
    </>
  )
}

export default React.memo(ProjectBlock)
