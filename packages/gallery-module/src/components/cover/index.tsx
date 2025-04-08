import { ProjectCoverVariant } from '@valley/db/config/constants'
import { cn, exhaustivnessCheck } from '@valley/shared'
import React, { useMemo } from 'react'
import InvertCover from '../cover-designs/invert'
import { File, Cover as ICover, Project } from '@valley/db'
import AlbumCover from '../cover-designs/album'
import CenterCover from '../cover-designs/center'
import ClassicCover from '../cover-designs/classic'
import LeftCover from '../cover-designs/left'
import LineCover from '../cover-designs/line'
import SplitCover from '../cover-designs/split'
import TopCover from '../cover-designs/top'
import useMediaQuery from '@valley/ui/useMediaQuery'
import { SMALL_VIEWPORT_WIDTH } from '@valley/ui/config/theme'

export const getCoverComponent = (coverVariant: ProjectCoverVariant) => {
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
}

export type CoverProps = {
  project: Project
  cover: ICover & { file: File }
  theme: 'dark' | 'light'
  position?: { x: number; y: number }
  timeZone?: string
  imageHost?: string
}

export const Cover: React.FC<CoverProps> = ({
  project,
  cover,
  theme,
  position,
  timeZone,
  imageHost = '',
}) => {
  const { coverVariant, title, dateShot, createdAt } = project
  const shouldShowMobileCover = useMediaQuery(
    `(max-width:${SMALL_VIEWPORT_WIDTH}px)`
  )
  const CoverComponent = useMemo(
    () => getCoverComponent(coverVariant),
    [coverVariant]
  )

  return (
    <CoverComponent
      cover={cover}
      dateShot={dateShot || createdAt}
      theme={theme}
      title={title}
      type={shouldShowMobileCover ? 'mobile' : 'desktop'}
      timeZone={timeZone}
      imageHost={imageHost}
      data-theme={theme}
      className={cn('w-full bg-stone-100 text-stone-900', {
        'bg-stone-950 text-stone-100': theme === 'dark',
      })}
      style={{
        ['--font-heading' as string]: "'" + project.headingFont + "'",
        ['--cover-position-x' as string]: (position || cover).x * 100 + '%',
        ['--cover-position-y' as string]: (position || cover).y * 100 + '%',
      }}
    />
  )
}
