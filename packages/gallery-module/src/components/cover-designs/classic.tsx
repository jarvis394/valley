import React from 'react'
import { ChevronDown } from 'geist-ui-icons'
import { type CoverDesignProps } from '.'
import { cn } from '@valley/shared'
import { getFileThumbnailQuery } from '@valley/ui/utils/getFileThumbnailQuery'
import { getFormattedDate } from '../../utils/get-formatted-date'

const ClassicCover: React.FC<CoverDesignProps> = ({
  title,
  cover,
  dateShot,
  timeZone,
  theme,
  type,
}) => {
  return (
    <div
      className={cn('h-full w-full bg-stone-100 p-8', {
        'bg-stone-950': theme === 'dark',
        'p-4': type === 'mobile',
      })}
    >
      <div
        style={{
          backgroundImage: `url(/api/files/${cover.file.path}?${getFileThumbnailQuery({ size: '2xl', file: cover.file })})`,
          backgroundPosition:
            'var(--cover-position-x, 50%) var(--cover-position-y, 50%)',
        }}
        className={cn(
          'fade-in relative flex h-full w-full flex-col items-center justify-between overflow-hidden rounded-2xl bg-cover bg-no-repeat pb-8 text-zinc-100 before:absolute before:inset-0 before:h-full before:w-full before:bg-zinc-950/12 before:content-[""]'
        )}
      >
        <div
          className={cn(
            'fade-in relative z-100 flex w-full flex-col items-center gap-3 bg-linear-to-b from-stone-950/32 to-transparent px-4 py-8 text-center'
          )}
        >
          {dateShot && (
            <p className="copy-16 opacity-80">
              {getFormattedDate(dateShot, timeZone)}
            </p>
          )}
          <h2 className="heading-48 font-heading">{title}</h2>
        </div>
        <ChevronDown className="mt-4" width="16" height="16" />
      </div>
    </div>
  )
}

export default ClassicCover
