import type { File } from '@valley/db'

export const THUMBNAIL_SIZES = {
  sm: 340,
  md: 576,
  lg: 1440,
} as const

export type ThumbnailSize = keyof typeof THUMBNAIL_SIZES

export const getFileThumbnailQuery = ({
  size,
  file,
}: {
  size: ThumbnailSize
  file: File
}) => {
  const qs = new URLSearchParams()
  const newWidth = THUMBNAIL_SIZES[size]
  const changeRatio = file.width ? newWidth / file.width : 1
  const newHeight = file.height
    ? Math.round(file.height * changeRatio)
    : newWidth

  qs.append('w', newWidth.toString())
  qs.append('h', newHeight.toString())

  return qs.toString()
}
