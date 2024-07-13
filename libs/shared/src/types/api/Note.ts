import { Note, Tag } from '@prisma/client'

export type NoteGetAllReq = unknown
export type NoteGetAllRes = {
  notes: Note[]
}

export type NoteGetReq = unknown
export type NoteGetRes = {
  note: Note | null
}

export type NoteDeleteReq = unknown
export type NoteDeleteRes = {
  ok: boolean
}

export type CreateNoteReq = Pick<Note, 'title' | 'markdown'> & {
  tags?: Array<Tag['id']>
}
export type CreateNoteRes = {
  note: Note
}

export type UpdateNoteReq = Partial<CreateNoteReq>
export type UpdateNoteRes = {
  note: Note
}

export type AddNoteTagReq = { tagId: Tag['id'] }
export type AddNoteTagRes = {
  note: Note
}

export type RemoveNoteTagReq = { tagId: Tag['id'] }
export type RemoveNoteTagRes = {
  note: Note
}
