import React from 'react'
import { ChevronDown } from 'geist-ui-icons'
import { type CoverDesignProps } from '.'
import Image from '@valley/ui/Image'
import { cn } from '@valley/shared'
import { getFormattedDate } from '../../utils/get-formatted-date'

const TopCover: React.FC<CoverDesignProps> = ({
  title,
  dateShot,
  theme,
  cover,
  timeZone,
}) => {
  return (
    <div
      className={cn(
        'fade-in flex h-full w-full flex-col items-center justify-between gap-4 bg-stone-100 px-4 pb-8 text-stone-900',
        {
          'bg-stone-950 text-stone-100': theme === 'dark',
        }
      )}
    >
      <span />
      <div className={'relative max-h-[70%] w-full'}>
        {cover && (
          <Image
            className="h-auto max-h-full w-auto max-w-full rounded-2xl"
            containerProps={{ className: 'mx-auto max-w-full' }}
            file={cover.file}
          />
        )}
        <div className="absolute inset-0 flex w-full flex-col items-center justify-center gap-3">
          <h2 className="heading-48 font-heading">{title}</h2>
          {dateShot && (
            <p className="copy-16 opacity-80">
              {getFormattedDate(dateShot, timeZone)}
            </p>
          )}
        </div>
      </div>
      <ChevronDown width="16" height="16" />
    </div>
  )
}

export default TopCover
