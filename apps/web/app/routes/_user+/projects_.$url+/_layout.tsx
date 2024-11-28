import React from 'react'
import { Outlet } from '@remix-run/react'
import ProjectToolbar from 'app/components/Toolbar/ProjectToolbar'
import { GeneralErrorBoundary } from 'app/components/ErrorBoundary'

export const shouldRevalidate = () => {
  return false
}

const ProjectLayout: React.FC = () => {
  return (
    <>
      <ProjectToolbar />
      <Outlet />
    </>
  )
}

export const ErrorBoundary = GeneralErrorBoundary

export default ProjectLayout
