import React from 'react'
import { Outlet } from '@remix-run/react'
import ProjectsToolbar from '../../../components/Toolbar/ProjectsToolbar'

const ProjectsLayout: React.FC = () => {
  return (
    <>
      <ProjectsToolbar />
      <Outlet />
    </>
  )
}

export default ProjectsLayout
