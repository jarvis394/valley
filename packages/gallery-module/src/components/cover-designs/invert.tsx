import React from 'react'
import { ChevronDown } from 'geist-ui-icons'
import { type CoverDesignProps } from '.'
import { cn, makeFileThumbnailPath } from '@valley/shared'
import { getFormattedDate } from '../../utils/get-formatted-date'

const InvertCover: React.FC<CoverDesignProps> = ({
  title,
  cover,
  dateShot,
  timeZone,
  imageHost = '',
  theme: _theme,
  type: _type,
  className,
  style,
  ...props
}) => {
  const path = makeFileThumbnailPath({
    file: cover.file,
    imageHost,
    size: '2xl',
  })

  return (
    <div
      {...props}
      style={{
        ...style,
        backgroundImage: `url(${path})`,
        backgroundPosition:
          'var(--cover-position-x, 50%) var(--cover-position-y, 50%)',
      }}
      className={cn(
        'fade-in relative flex h-[calc(100%-52px)] w-full flex-col justify-end bg-stone-950 bg-cover bg-no-repeat text-stone-100 before:absolute before:inset-0 before:h-full before:w-full before:bg-stone-950/12 before:content-[""]',
        className
      )}
    >
      <div
        className={cn(
          'fade-in relative z-100 flex w-full flex-col items-center gap-3 bg-linear-to-t from-stone-950/32 to-transparent px-4 py-8 text-center'
        )}
      >
        <h2 className="heading-48 font-heading">{title}</h2>
        {dateShot && (
          <p className="copy-16 opacity-80">
            {getFormattedDate(dateShot, timeZone)}
          </p>
        )}
        <ChevronDown className="mt-4" width="16" height="16" />
      </div>
    </div>
  )
}

export default InvertCover
