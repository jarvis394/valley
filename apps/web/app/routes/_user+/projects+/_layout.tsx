import React from 'react'
import { Outlet } from 'react-router'
import ProjectsToolbar from '../../../components/Toolbar/ProjectsToolbar'
import { GeneralErrorBoundary } from 'app/components/ErrorBoundary'

export const shouldRevalidate = () => {
  return false
}

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
