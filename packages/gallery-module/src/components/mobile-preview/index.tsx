import type { Cover, File, Project } from '@valley/db'
import React, { useMemo } from 'react'
import { cn } from '@valley/shared'
import { getCoverComponent } from '../cover'

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
  const CoverComponent = useMemo(
    () => getCoverComponent(coverVariant),
    [coverVariant]
  )

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
