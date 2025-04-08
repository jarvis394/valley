import { type File } from '@valley/db'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import Spinner from '@valley/ui/Spinner'
import { useHydrated } from 'remix-utils/use-hydrated'
import {
  getFileThumbnailQuery,
  ThumbnailSize,
} from '../utils/getFileThumbnailQuery'
import { cn } from '@valley/shared'
import { Image as ImageIcon } from 'geist-ui-icons'

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
      src?: string | null
    }

export type ImageProps = ImageOwnProps & {
  containerProps?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >
} & Omit<
    React.DetailedHTMLProps<
      React.ImgHTMLAttributes<HTMLImageElement>,
      HTMLImageElement
    >,
    'src'
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

const mergeRefs = <T,>(
  ...inputRefs: Array<React.Ref<T> | undefined>
): React.Ref<T> | React.RefCallback<T> => {
  const filteredInputRefs = inputRefs.filter(Boolean)

  if (filteredInputRefs.length <= 1) {
    const firstRef = filteredInputRefs[0]

    return firstRef || null
  }

  return function mergedRefs(ref) {
    for (const inputRef of filteredInputRefs) {
      if (typeof inputRef === 'function') {
        inputRef(ref)
      } else if (inputRef) {
        ;(inputRef as React.MutableRefObject<T | null>).current = ref
      }
    }
  }
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
  ref,
  ...props
}) => {
  const {
    className: containerClassName,
    style: containerStyle,
    ...otherContainerProps
  } = containerProps
  const [error, setError] = useState(false)
  const [imageRef, loaded, onLoad] = useImageLoaded()
  const mergedRef = mergeRefs(ref, imageRef)
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

    return src || undefined
  }, [file, height, imageHost, src, thumbnail, width])

  const onError = () => {
    setError(true)
  }

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
      data-errored={error}
    >
      {error && <ImageIcon className="text-hint m-4" />}
      {!loaded && !error && (
        <Spinner className="absolute top-[50%] left-[50%] -z-1 -translate-x-[50%] -translate-y-[50%]" />
      )}
      {!error && (
        <img
          {...props}
          className={cn(className, 'fade')}
          data-fade-in={isHydrated ? loaded : true}
          ref={mergedRef}
          onLoad={onLoad}
          onError={onError}
          decoding="async"
          src={imageSrc}
          alt={alt || file?.name || ''}
        />
      )}
    </div>
  )
}

export default React.memo(Image)
