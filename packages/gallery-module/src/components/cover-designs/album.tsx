import React from 'react'
import { ChevronDown } from 'geist-ui-icons'
import { type CoverDesignProps } from '.'
import Image from '@valley/ui/Image'
import { cn } from '@valley/shared'
import { getFormattedDate } from '../../utils/get-formatted-date'

const AlbumCover: React.FC<CoverDesignProps> = ({
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
        'fade-in relative flex h-full w-full flex-col items-center justify-center gap-8 bg-stone-100 px-4 pb-8 text-center text-stone-900',
        className,
        {
          'bg-stone-950 text-stone-100': theme === 'dark',
        }
      )}
    >
      {cover && (
        <Image
          className="h-auto max-h-full w-auto max-w-full rounded-2xl"
          containerProps={{ className: 'mx-auto max-h-[50%] max-w-full' }}
          file={cover.file}
          imageHost={imageHost}
        />
      )}
      <div className="flex w-full flex-col gap-3">
        <h2 className="heading-48 font-heading">{title}</h2>
        {dateShot && (
          <p className="copy-16 opacity-80">
            {getFormattedDate(dateShot, timeZone)}
          </p>
        )}
      </div>
      <ChevronDown width="16" height="16" className="absolute bottom-8" />
    </div>
  )
}

export default AlbumCover
