import { File } from '@valley/db'
import { exhaustivnessCheck } from '@valley/shared'
import dayjs from 'dayjs'

export type SortFilesFunctionProps = {
  files: File[]
  orderBy: 'name' | 'createdAt' | 'dateShot'
  direction: 'asc' | 'desc'
}

export const sortFiles = ({
  files,
  orderBy,
  direction,
}: SortFilesFunctionProps) => {
  const res = [...files]

  res.sort((a, b) => {
    let res = 0
    switch (orderBy) {
      case 'name':
        if (!a.name || !b.name) return 1
        res = a.name?.localeCompare(b.name, undefined, {
          numeric: true,
        })
        break
      case 'createdAt':
        res = Number(a.createdAt) - Number(b.createdAt)
        break
      case 'dateShot':
        res = Math.sign(
          dayjs(a.exif?.DateTimeOriginal).unix() -
            dayjs(b.exif?.DateTimeOriginal).unix()
        )
        break
      default:
        exhaustivnessCheck(orderBy)
        break
    }

    return direction === 'asc' ? res : -1 * res
  })

  return res
}
