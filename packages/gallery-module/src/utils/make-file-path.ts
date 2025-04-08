import type { File } from '@valley/db'
import {
  getFileThumbnailQuery,
  ThumbnailSize,
} from '@valley/ui/utils/getFileThumbnailQuery'

export const makeFilePath = (props: {
  imageHost?: string
  size?: ThumbnailSize
  file: Pick<File, 'canHaveThumbnails' | 'width' | 'height' | 'path'>
}) => {
  const qs = getFileThumbnailQuery(props)

  return props.imageHost + '/api/files/' + props.file.path + '?' + qs
}
