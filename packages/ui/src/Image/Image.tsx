import { File } from '@valley/db'
import cx from 'classnames'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import styles from './Image.module.css'
import Spinner from '@valley/ui/Spinner'
import { useHydrated } from 'remix-utils/use-hydrated'
import {
  getFileThumbnailQuery,
  ThumbnailSize,
} from '../utils/getFileThumbnailQuery'

export type ImageOwnProps =
  | {
      file: File
      thumbnail?: ThumbnailSize
      src?: never
    }
  | {
      file?: never
      thumbnail?: never
      src: string
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
  })

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
  ...props
}) => {
  const { className: containerClassName, ...otherContainerProps } =
    containerProps
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

      return '/api/files/' + file.key + '?' + resizeQuery
    }

    return src
  }, [file, height, src, thumbnail, width])

  return (
    <div
      {...otherContainerProps}
      className={cx(styles.image, containerClassName)}
    >
      {!loaded && <Spinner className={styles.image__spinner} />}
      <img
        {...props}
        className={cx(styles.image__image, className, 'fade')}
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

export default Image
