import type { Cover, File, Project } from '@valley/db'
import { ProjectCoverVariant } from '@valley/db/config/constants'
import React, { useMemo } from 'react'
import AlbumCover from '../cover-designs/album'
import CenterCover from '../cover-designs/center'
import SplitCover from '../cover-designs/split'
import LeftCover from '../cover-designs/left'
import ClassicCover from '../cover-designs/classic'
import { cn, exhaustivnessCheck } from '@valley/shared'
import LineCover from '../cover-designs/line'
import TopCover from '../cover-designs/top'
import InvertCover from '../cover-designs/invert'

export type MobilePreviewProps = {
  project: Project
  cover: Cover & { file: File }
  theme: 'dark' | 'light'
  position?: { x: number; y: number }
  timeZone: string
}

export const MobilePreview: React.FC<MobilePreviewProps> = ({
  project,
  cover,
  theme,
  position,
  timeZone,
}) => {
  const { coverVariant } = project
  const CoverComponent = useMemo(() => {
    switch (coverVariant) {
      case ProjectCoverVariant.CENTER:
        return CenterCover
      case ProjectCoverVariant.SPLIT:
        return SplitCover
      case ProjectCoverVariant.LEFT:
        return LeftCover
      case ProjectCoverVariant.ALBUM:
        return AlbumCover
      case ProjectCoverVariant.CLASSIC:
        return ClassicCover
      case ProjectCoverVariant.LINE:
        return LineCover
      case ProjectCoverVariant.TOP:
        return TopCover
      case ProjectCoverVariant.INVERT:
        return InvertCover
      default:
        return exhaustivnessCheck(coverVariant)
    }
  }, [coverVariant])

  return (
    <div
      className={cn('h-full w-full bg-stone-100 text-stone-900', {
        'bg-stone-950 text-stone-100': theme === 'dark',
      })}
      data-theme={theme}
      style={{
        ['--font-heading' as string]: "'" + project.headingFont + "'",
        ['--cover-position-x' as string]: (position || cover).x * 100 + '%',
        ['--cover-position-y' as string]: (position || cover).y * 100 + '%',
      }}
    >
      <CoverComponent
        cover={cover}
        dateShot={project.dateShot || project.createdAt}
        theme={theme}
        title={project.title}
        type="mobile"
        timeZone={timeZone}
      />
    </div>
  )
}
