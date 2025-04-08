import Spinner from '@valley/ui/Spinner'
import React from 'react'

const ProjectGalleryLoading = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Spinner className="fade-in" />
    </div>
  )
}

export default ProjectGalleryLoading
