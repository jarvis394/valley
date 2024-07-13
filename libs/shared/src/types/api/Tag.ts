import { Tag } from '@prisma/client'

export type TagGetAllReq = unknown
export type TagGetAllRes = {
  tags: Tag[]
}

export type TagGetReq = unknown
export type TagGetRes = {
  tag: Tag | null
}

export type TagDeleteReq = unknown
export type TagDeleteRes = {
  ok: boolean
}

export type CreateTagReq = Pick<Tag, 'icon' | 'label'>
export type CreateTagRes = {
  tag: Tag
}

export type UpdateTagReq = Partial<CreateTagReq>
export type UpdateTagRes = {
  tag: Tag
}
