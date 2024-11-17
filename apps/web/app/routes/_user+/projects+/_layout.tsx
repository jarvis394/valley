import React from 'react'
import { Outlet } from '@remix-run/react'
import ProjectsToolbar from '../../../components/Toolbar/ProjectsToolbar'
import { GeneralErrorBoundary } from 'app/components/ErrorBoundary'

const ProjectsLayout: React.FC = () => {
  return (
    <>
      <ProjectsToolbar />
      <Outlet />
    </>
  )
}

export const ErrorBoundary = GeneralErrorBoundary

export default ProjectsLayout
