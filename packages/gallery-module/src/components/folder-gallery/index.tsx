import { FolderWithFiles } from '@valley/shared'
import React, { useMemo, useState } from 'react'
import Image from '@valley/ui/Image'
import { JustifiedGrid } from '@egjs/react-grid'
import { Gallery, Item } from 'react-photoswipe-gallery'
import type { PreparedPhotoSwipeOptions } from 'photoswipe'

import 'photoswipe/dist/photoswipe.css'
import { sortFiles } from '../../utils/sort-files'

const closeSVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>'
const zoomSVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zoom-in"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></svg>'

const photoswipeOptions: Partial<PreparedPhotoSwipeOptions> = {
  clickToCloseNonZoomable: true,
  showHideOpacity: true,
  showAnimationDuration: 300,
  hideAnimationDuration: 300,
  bgOpacity: 0.8,
  pinchToClose: true,
  bgClickAction: 'close',
  arrowNext: true,
  arrowPrev: true,
  wheelToZoom: true,
  closeOnVerticalDrag: true,
  counter: true,
  closeSVG,
  zoomSVG,
  close: true,
}

export type FolderGalleryProps = {
  folder: FolderWithFiles
  imageHost?: string
}

export const FolderGallery: React.FC<FolderGalleryProps> = ({
  folder,
  imageHost = '',
}) => {
  const [visible, setVisible] = useState(false)
  const sortedFiles = useMemo(
    () =>
      sortFiles({ files: folder.files, direction: 'asc', orderBy: 'dateShot' }),
    [folder.files]
  )

  if (folder.files.length === 0) {
    return null
  }

  return (
    <div
      className="mx-auto flex w-full max-w-[2560px] flex-col gap-4 pt-4"
      id={folder.id}
    >
      <h3 className="heading-24 w-full text-center">{folder.title}</h3>
      <Gallery options={photoswipeOptions}>
        <JustifiedGrid
          className="fade transition-all"
          data-fade-in={visible}
          gap={2}
          sizeRange={[240, 480]}
          isCroppedSize
          autoResize
          columnRange={[2, 8]}
          onRenderComplete={() => setVisible(true)}
        >
          {sortedFiles.map((file) => (
            <Item
              width={file.width!}
              height={file.height!}
              key={file.id}
              content={
                <Image
                  className="h-full w-full"
                  file={file}
                  thumbnail="xl"
                  imageHost={imageHost}
                />
              }
            >
              {({ ref, open }) => (
                <Image
                  containerProps={{
                    className:
                      'transition-all rounded-xs bg-alpha-transparent-07',
                    style: {
                      aspectRatio: `${file.width} / ${file.height}`,
                    },
                  }}
                  className="h-full w-full cursor-pointer object-cover"
                  file={file}
                  thumbnail="lg"
                  loading="lazy"
                  onClick={open}
                  ref={ref}
                  imageHost={imageHost}
                  style={{
                    animationPlayState: visible ? 'running' : 'paused',
                  }}
                />
              )}
            </Item>
          ))}
        </JustifiedGrid>
      </Gallery>
    </div>
  )
}
