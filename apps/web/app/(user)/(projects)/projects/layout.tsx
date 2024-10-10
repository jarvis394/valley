import ProjectsToolbar from '../../../components/Toolbar/ProjectsToolbar'
import React, { Suspense } from 'react'

const ProjectsPageLayout: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <Suspense>
      <ProjectsToolbar />
      {children}
    </Suspense>
  )
}

export default ProjectsPageLayout
