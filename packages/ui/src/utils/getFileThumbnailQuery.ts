import type { File } from '@valley/db'

export const THUMBNAIL_SIZES = {
  sm: 340,
  md: 576,
  lg: 1440,
  xl: 1920,
  '2xl': 2560,
  '4xl': 3840,
} as const

export type ThumbnailSize = keyof typeof THUMBNAIL_SIZES

export type GetFileThumbnailQueryProps = {
  size?: ThumbnailSize | 'original'
  file: Pick<File, 'canHaveThumbnails' | 'width' | 'height'>
}

export const getFileThumbnailDimensions = ({
  size,
  file,
}: GetFileThumbnailQueryProps) => {
  if (!file.canHaveThumbnails || !file.width || !file.height)
    return { width: 0, height: 0 }
  if (size === 'original') return { width: file.width, height: file.height }

  const newWidth = size ? THUMBNAIL_SIZES[size] : file.width
  const changeRatio = file.width ? newWidth / file.width : 1
  const newHeight = file.height
    ? Math.round(file.height * changeRatio)
    : newWidth

  return { width: newWidth, height: newHeight }
}

export const getFileThumbnailQuery = ({
  size,
  file,
}: GetFileThumbnailQueryProps) => {
  if (!file.canHaveThumbnails || !file.width) return ''

  const qs = new URLSearchParams()
  const { width, height } = getFileThumbnailDimensions({ file, size })

  qs.append('w', width.toString())
  qs.append('h', height.toString())

  return qs.toString()
}
