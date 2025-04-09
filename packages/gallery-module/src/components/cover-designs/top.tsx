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
  imageHost = '',
  type: _type,
  className,
  ...props
}) => {
  return (
    <div
      {...props}
      className={cn(
        'fade-in flex h-full w-full flex-col items-center justify-between gap-4 bg-stone-100 px-4 pb-8 text-stone-900',
        {
          'bg-stone-950 text-stone-100': theme === 'dark',
        },
        className
      )}
    >
      <span />
      <div className={'relative max-h-[70%] w-full'}>
        {cover && (
          <Image
            className="h-auto max-h-full w-auto max-w-full rounded-2xl"
            containerProps={{
              className:
                'mx-auto max-w-full before:absolute before:inset-0 before:h-full before:w-full before:bg-stone-950/12 before:content-[""]',
            }}
            file={cover.file}
            imageHost={imageHost}
          />
        )}
        <div className="break-word absolute inset-0 flex w-full flex-col items-center justify-center gap-3 text-center">
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
