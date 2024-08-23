import ProjectsToolbar from '../../../components/Toolbar/ProjectsToolbar'
import React from 'react'

const ProjectsPageLayout: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <>
      <ProjectsToolbar />
      {children}
    </>
  )
}

export default ProjectsPageLayout
