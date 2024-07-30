import { File, Folder } from '@prisma/client'

export type FileMultipartUploadCompletedPart = {
  ETag: string
  PartNumber: number
}

export type FileGetAllInFolderReq = unknown
export type FileGetAllInFolderRes = {
  files: File[]
}

export type FileMultipartUploadStartReq = {
  size: number
  chunks: number
  filename: string
  folderId: Folder['id']
}
export type FileMultipartUploadStartRes = {
  uploadId: string
}

export type FileMultipartUploadChunkReq = {
  uploadId: string
  part: number
  partSize: number
  fileSize: number
}
export type FileMultipartUploadChunkRes = {
  etag: string
  part: number
  partSize: number
  filename: string
  fileSize: number
}

export type FileMultipartUploadCompleteReq = {
  uploadId: string
  filename: string
  parts: FileMultipartUploadCompletedPart[]
}
