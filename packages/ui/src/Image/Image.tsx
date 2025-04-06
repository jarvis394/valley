import { type File } from '@valley/db'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import Spinner from '@valley/ui/Spinner'
import { useHydrated } from 'remix-utils/use-hydrated'
import {
  getFileThumbnailQuery,
  ThumbnailSize,
} from '../utils/getFileThumbnailQuery'
import { cn } from '@valley/shared'

export type ImageOwnProps =
  | {
      file: File
      thumbnail?: ThumbnailSize
      imageHost?: string
      src?: never
    }
  | {
      file?: never
      thumbnail?: never
      imageHost?: never
      src?: string
    }

export type ImageProps = ImageOwnProps & {
  containerProps?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >
} & React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >

const useImageLoaded = () => {
  const [loaded, setLoaded] = useState(false)
  const ref = useRef<HTMLImageElement>(null)

  const onLoad = () => {
    setLoaded(true)
  }

  useEffect(() => {
    if (ref.current && ref.current.complete) {
      onLoad()
    }
  }, [])

  return [ref, loaded, onLoad] as const
}

const Image: React.FC<ImageProps> = ({
  file,
  width,
  height,
  thumbnail,
  src,
  alt,
  className,
  containerProps = {},
  imageHost = '',
  ...props
}) => {
  const {
    className: containerClassName,
    style: containerStyle,
    ...otherContainerProps
  } = containerProps
  const [ref, loaded, onLoad] = useImageLoaded()
  const isHydrated = useHydrated()
  const imageSrc = useMemo(() => {
    if (file && !src) {
      let resizeQuery = ''
      if (thumbnail) {
        resizeQuery = getFileThumbnailQuery({ size: thumbnail, file })
      } else {
        const qs = new URLSearchParams()
        width && qs.append('w', width.toString())
        height && qs.append('h', height.toString())
        resizeQuery = qs.toString()
      }

      return imageHost + '/api/files/' + file.path + '?' + resizeQuery
    }

    return src
  }, [file, height, imageHost, src, thumbnail, width])

  return (
    <div
      {...otherContainerProps}
      style={{
        aspectRatio: width && height ? +width / +height : undefined,
        ...containerStyle,
      }}
      className={cn(
        'relative isolate flex h-full w-full shrink-0 items-center justify-center overflow-hidden',
        containerClassName
      )}
      data-loaded={loaded}
    >
      {!loaded && (
        <Spinner className="absolute top-[50%] left-[50%] -z-1 -translate-x-[50%] -translate-y-[50%]" />
      )}
      <img
        {...props}
        className={cn(className, 'fade')}
        data-fade-in={isHydrated ? loaded : true}
        ref={ref}
        onLoad={onLoad}
        decoding="async"
        src={imageSrc}
        alt={alt || file?.name || ''}
      />
    </div>
  )
}

export default React.memo(Image)
