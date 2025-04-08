import React from 'react'
import { ChevronDown } from 'geist-ui-icons'
import { type CoverDesignProps } from '.'
import { cn } from '@valley/shared'
import { getFormattedDate } from '../../utils/get-formatted-date'
import { makeFilePath } from '../../utils/make-file-path'

const LineCover: React.FC<CoverDesignProps> = ({
  title,
  theme,
  cover,
  dateShot,
  timeZone,
  imageHost = '',
  type: _type,
  className,
  ...props
}) => {
  const path = makeFilePath({ file: cover.file, imageHost, size: '2xl' })

  return (
    <div
      {...props}
      className={cn('flex h-full w-full flex-col bg-stone-100 text-stone-900', {
        'bg-stone-950 text-stone-100': theme === 'dark',
        className,
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
          backgroundImage: `url(${path})`,
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
