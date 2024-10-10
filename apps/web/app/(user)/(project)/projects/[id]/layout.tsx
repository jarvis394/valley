import ProjectToolbar from '../../../../components/Toolbar/ProjectToolbar'
import React, { Suspense } from 'react'

const ProjectPageLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Suspense>
      <ProjectToolbar />
      {children}
    </Suspense>
  )
}

export default ProjectPageLayout
