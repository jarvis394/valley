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
  size?: ThumbnailSize
  file: File
}

export const getFileThumbnailQuery = ({
  size,
  file,
}: GetFileThumbnailQueryProps) => {
  if (!file.canHaveThumbnails || !file.width) return ''

  const qs = new URLSearchParams()
  const newWidth = size ? THUMBNAIL_SIZES[size] : file.width
  const changeRatio = file.width ? newWidth / file.width : 1
  const newHeight = file.height
    ? Math.round(file.height * changeRatio)
    : newWidth

  qs.append('w', newWidth.toString())
  qs.append('h', newHeight.toString())

  return qs.toString()
}
