'use client'

import { FolderWithFiles } from '@valley/shared'
import React, { useMemo, useState } from 'react'
import { JustifiedGrid } from '@egjs/react-grid'
import Image from '@valley/ui/Image'
import { WEB_SERVICE_URL } from '../../config/constants'
import styles from './FolderGallery.module.css'

type FolderGalleryProps = {
  folder: FolderWithFiles
}

const FolderGallery: React.FC<FolderGalleryProps> = ({ folder }) => {
  const [visible, setVisible] = useState(false)
  const sortedFiles = useMemo(
    () =>
      folder.files.sort((a, b) => {
        if (!a.name || !b.name) return 1
        return a.name?.localeCompare(b.name, undefined, {
          numeric: true,
        })
      }),
    []
  )

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg text-medium">{folder.title}</h3>
      <JustifiedGrid
        className="transition-all fade"
        data-fade-in={visible}
        gap={2}
        sizeRange={[240, Infinity]}
        isCroppedSize
        autoResize
        columnRange={[2, 4]}
        onRenderComplete={() => setVisible(true)}
      >
        {sortedFiles.map((file) => (
          <Image
            containerProps={{
              className:
                'transition-all rounded-xs ' + styles.folderGallery__image,
              style: {
                aspectRatio: `${file.width} / ${file.height}`,
              },
            }}
            className="h-full w-full object-cover"
            file={file}
            thumbnail="lg"
            loading="lazy"
            style={{
              animationPlayState: visible ? 'running' : 'paused',
            }}
            imageHost={WEB_SERVICE_URL}
            key={file.id}
          />
        ))}
      </JustifiedGrid>
    </div>
  )
}

export default FolderGallery
