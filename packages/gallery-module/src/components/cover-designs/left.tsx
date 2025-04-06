import React from 'react'
import { type CoverDesignProps } from '.'
import { cn } from '@valley/shared'
import { getFileThumbnailQuery } from '@valley/ui/utils/getFileThumbnailQuery'
import { getFormattedDate } from '../../utils/get-formatted-date'

const LeftCover: React.FC<CoverDesignProps> = ({
  title,
  cover,
  dateShot,
  timeZone,
}) => {
  return (
    <div
      style={{
        backgroundImage: `url(/api/files/${cover.file.path}?${getFileThumbnailQuery({ size: '2xl', file: cover.file })})`,
        backgroundPosition:
          'var(--cover-position-x, 50%) var(--cover-position-y, 50%)',
      }}
      className={cn(
        'fade-in relative flex h-full w-full flex-col justify-end bg-cover bg-no-repeat text-stone-100 before:absolute before:inset-0 before:h-full before:w-full before:bg-stone-950/12 before:content-[""]'
      )}
    >
      <div
        className={cn(
          'fade-in relative z-100 flex w-full flex-col items-start gap-3 bg-linear-to-t from-stone-950/32 to-transparent p-16 text-center'
        )}
      >
        <h2 className="heading-48 font-heading w-fit">{title}</h2>
        {dateShot && (
          <p className="copy-16 opacity-80">
            {getFormattedDate(dateShot, timeZone)}
          </p>
        )}
      </div>
    </div>
  )
}

export default LeftCover
