import { FolderWithFiles } from '@valley/shared'
import React, { useMemo, useState } from 'react'
import Image from '@valley/ui/Image'
import { JustifiedGrid } from '@egjs/react-grid'

export type FolderGalleryProps = {
  folder: FolderWithFiles
  imageHost?: string
}

export const FolderGallery: React.FC<FolderGalleryProps> = ({
  folder,
  imageHost,
}) => {
  const [visible, setVisible] = useState(false)
  const sortedFiles = useMemo(
    () =>
      folder.files.sort((a, b) => {
        if (!a.name || !b.name) return 1
        return a.name?.localeCompare(b.name, undefined, {
          numeric: true,
        })
      }),
    [folder.files]
  )

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-medium text-lg">{folder.title}</h3>
      <JustifiedGrid
        className="fade transition-all"
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
              className: 'transition-all rounded-xs bg-alpha-transparent-07',
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
            imageHost={imageHost}
            key={file.id}
          />
        ))}
      </JustifiedGrid>
    </div>
  )
}
