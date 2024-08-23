import ProjectToolbar from '../../../../components/Toolbar/ProjectToolbar'
import React from 'react'

const ProjectPageLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <>
      <ProjectToolbar />
      {children}
    </>
  )
}

export default ProjectPageLayout
