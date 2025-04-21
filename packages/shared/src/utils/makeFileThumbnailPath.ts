import type { File } from '@valley/db'
import {
  getFileThumbnailQuery,
  ThumbnailSize,
} from '@valley/ui/utils/getFileThumbnailQuery'

export const makeFileThumbnailPath = (props: {
  imageHost?: string
  size?: ThumbnailSize
  width?: number
  height?: number
  qs?: string
  file: Pick<File, 'canHaveThumbnails' | 'width' | 'height' | 'path'>
}) => {
  let qs = ''

  if (props.qs) {
    qs = props.qs
  } else if (props.width || props.height) {
    const resizeQuery = new URLSearchParams()
    props.width && resizeQuery.append('w', props.width.toString())
    props.height && resizeQuery.append('w', props.height.toString())
    qs = resizeQuery.toString()
  } else {
    qs = getFileThumbnailQuery(props)
  }

  return (
    props.imageHost + '/api/files/' + props.file.path + '/thumbnail' + '?' + qs
  )
}
