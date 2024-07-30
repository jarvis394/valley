import React from 'react'
import StoreProvider from '../../components/StoreProvider/StoreProvider'

const ProjectLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <StoreProvider>{children}</StoreProvider>
}

export default ProjectLayout
