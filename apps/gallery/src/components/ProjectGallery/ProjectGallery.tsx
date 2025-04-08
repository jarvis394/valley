'use client'

import type { Folder } from '@valley/db'
import { Cover } from '@valley/gallery-module/cover'
import { FolderGallery } from '@valley/gallery-module/folder-gallery'
import { cn, ProjectWithFoldersAndFiles, UserFull } from '@valley/shared'
import React from 'react'
import { WEB_SERVICE_URL } from '../../config/constants'
import Button from '@valley/ui/Button'
import Link from 'next/link'
import { ProjectCoverVariant } from '@valley/db/config/constants'
import { ArrowLeft } from 'geist-ui-icons'
import Avatar from '@valley/ui/Avatar'
import ButtonBase from '@valley/ui/ButtonBase'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

export type ProjectGalleryProps = {
  project: ProjectWithFoldersAndFiles & {
    user: Pick<
      UserFull,
      'name' | 'domains' | 'serviceDomain' | 'image' | 'avatar'
    >
  }
}

const ProjectGallery: React.FC<ProjectGalleryProps> = ({ project }) => {
  const userDomain = project.user.domains[0] || project.user.serviceDomain
  const foldersWithFiles = project.folders.filter(
    (folder) => folder.files.length > 0
  )

  const scrollToFolder = (folderId: Folder['id']) => {
    const folderContainerElement = document.getElementById(folderId)
    if (!folderContainerElement) return

    window.scrollTo({
      top: folderContainerElement.offsetTop - 52,
      behavior: 'smooth',
    })
  }

  return (
    <div className="min-h-full">
      <div
        className={cn('h-dvh w-full', {
          '-mb-13': project.coverVariant === ProjectCoverVariant.INVERT,
        })}
      >
        {project.cover && (
          <Cover
            cover={project.cover}
            project={project}
            theme="dark"
            imageHost={WEB_SERVICE_URL}
          />
        )}
      </div>
      <nav className="bg-paper/80 border-alpha-transparent-07 sticky top-0 z-50 flex flex-row border-b-1 backdrop-blur-2xl">
        <ButtonBase
          asChild
          variant="primary"
          className="my-1.5 ml-2 flex shrink-0 items-center gap-2 px-3 pr-2 font-medium md:gap-3 md:px-4"
        >
          <Link href={'/' + userDomain}>
            <ArrowLeft />
            <div className="flex items-center gap-2">
              <Avatar src={project.user?.image} file={project.user?.avatar}>
                {project.user?.name?.[0]?.toUpperCase()}
              </Avatar>
              <p className="max-md:hidden">{project.user.name}</p>
            </div>
          </Link>
        </ButtonBase>
        <OverlayScrollbarsComponent
          defer
          options={{
            scrollbars: { theme: 'os-theme-light', autoHide: 'leave' },
            paddingAbsolute: true,
          }}
          className="px-2 py-1.5"
        >
          <div className="flex grow flex-row gap-1">
            {foldersWithFiles.map((folder) => (
              <Button
                variant="tertiary"
                size="md"
                key={'project-bar-button-' + folder.id}
                style={{ fontWeight: 400 }}
                onClick={scrollToFolder.bind(null, folder.id)}
              >
                {folder.title}
              </Button>
            ))}
          </div>
        </OverlayScrollbarsComponent>
      </nav>
      <div className="flex flex-col gap-4 px-0.25 md:px-2">
        {foldersWithFiles.map((folder) => (
          <FolderGallery
            key={folder.id}
            folder={folder}
            imageHost={WEB_SERVICE_URL}
          />
        ))}
      </div>
    </div>
  )
}

export default ProjectGallery
