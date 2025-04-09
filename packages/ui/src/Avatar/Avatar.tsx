import React from 'react'
import Image from '../Image/Image'
import { ThumbnailSize } from '../utils/getFileThumbnailQuery'
import type { File } from '@valley/db'
import { cn } from '@valley/shared'

export type AvatarProps = {
  file?: File | null
  thumbnail?: ThumbnailSize
  imageHost?: string
  src?: string | null
  square?: boolean
} & Omit<
  React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >,
  'src'
>

const Avatar: React.FC<AvatarProps> = ({
  className,
  src,
  file,
  thumbnail,
  imageHost = '',
  children,
  square,
  ...props
}) => {
  return (
    <div
      {...props}
      className={cn(
        'copy-12 bg-alpha-transparent-12 flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full select-none',
        {
          'rounded-[6px]': square,
        },
        className
      )}
    >
      {file && (
        <Image
          {...props}
          className="h-full w-full"
          file={file}
          thumbnail={thumbnail}
          imageHost={imageHost}
          width={64}
          height={64}
        />
      )}
      {src && !file && (
        <Image
          {...props}
          className="h-full w-full"
          src={src}
          width={28}
          height={28}
        />
      )}
      {!src && children}
    </div>
  )
}

export default Avatar
