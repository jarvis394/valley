import React from 'react'
import { ChevronDown } from 'geist-ui-icons'
import { type CoverDesignProps } from '.'
import { cn } from '@valley/shared'
import { getFileThumbnailQuery } from '@valley/ui/utils/getFileThumbnailQuery'
import { getFormattedDate } from '../../utils/get-formatted-date'

const SplitCover: React.FC<CoverDesignProps> = ({
  title,
  theme,
  cover,
  type,
  dateShot,
  timeZone,
}) => {
  return (
    <div
      className={cn('flex h-full w-full flex-col bg-stone-100 text-stone-900', {
        'flex-row': type === 'desktop',
        'bg-stone-950 text-stone-100': theme === 'dark',
      })}
    >
      <div
        style={{
          backgroundImage: `url(/api/files/${cover.file.path}?${getFileThumbnailQuery({ size: '2xl', file: cover.file })})`,
          backgroundPosition:
            'var(--cover-position-x, 50%) var(--cover-position-y, 50%)',
        }}
        className={'fade-in flex h-full basis-1/2 bg-cover bg-no-repeat'}
      />
      <div className="fade-in relative flex h-full basis-1/2 flex-col items-center justify-between gap-4 py-8 text-center">
        <span />
        <div className="flex flex-col gap-3">
          <h2 className="heading-48 font-heading">{title}</h2>
          {dateShot && (
            <p className="copy-16 opacity-80">
              {getFormattedDate(dateShot, timeZone)}
            </p>
          )}
        </div>
        <ChevronDown width="16" height="16" />
      </div>
    </div>
  )
}

export default SplitCover
