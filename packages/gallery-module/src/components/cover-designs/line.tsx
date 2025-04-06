import React from 'react'
import { ChevronDown } from 'geist-ui-icons'
import { type CoverDesignProps } from '.'
import { cn } from '@valley/shared'
import { getFileThumbnailQuery } from '@valley/ui/utils/getFileThumbnailQuery'
import { getFormattedDate } from '../../utils/get-formatted-date'

const LineCover: React.FC<CoverDesignProps> = ({
  title,
  theme,
  cover,
  dateShot,
  timeZone,
}) => {
  return (
    <div
      className={cn('flex h-full w-full flex-col bg-stone-100 text-stone-900', {
        'bg-stone-950 text-stone-100': theme === 'dark',
      })}
    >
      <div className="fade-in relative flex flex-col items-center gap-3 py-8 text-center">
        <h2 className="heading-48 font-heading">{title}</h2>
        {dateShot && (
          <p className="copy-16 opacity-80">
            {getFormattedDate(dateShot, timeZone)}
          </p>
        )}
      </div>
      <div
        style={{
          backgroundImage: `url(/api/files/${cover.file.path}?${getFileThumbnailQuery({ size: '2xl', file: cover.file })})`,
          backgroundPosition:
            'var(--cover-position-x, 50%) var(--cover-position-y, 50%)',
        }}
        className="fade-in flex h-full flex-col items-center justify-end bg-cover bg-no-repeat pb-8"
      >
        <ChevronDown className="text-stone-100" width="16" height="16" />
      </div>
    </div>
  )
}

export default LineCover
