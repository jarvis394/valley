import { File } from '@valley/db'

export enum TusHookType {
  PRE_CREATE = 'pre-create',
  POST_CREATE = 'post-create',
  POST_RECEIVE = 'post-receive',
  PRE_FINISH = 'pre-finish',
  POST_FINISH = 'post-finish',
  POST_TERMINATE = 'post-terminate',
}

export type TusUploadMetadata = {
  filename?: string
  filetype?: string
  'normalized-name': string
  type: string
  'upload-id': string
  'project-id': string
  'folder-id': string
}

export type TusHookData = {
  Type: TusHookType
  Event: {
    Upload: {
      ID: string
      Size: number
      Offset: number
      MetaData: TusUploadMetadata
      IsPartial: boolean
      IsFinal: boolean
      PartialUploads: unknown
      Storage: {
        Bucket: string
        Key: string
        Type: string
      }
    }
    HTTPRequest: {
      Method: string
      URI: string
      RemoteAddr: string
      Header: Record<string, string>
    }
  }
}

export type TusHookResponse = {
  RejectUpload?: boolean
  HTTPResponse: {
    StatusCode: number
    Body?: string
    Header?: Record<string, string>
  }
  ChangeFileInfo?: {
    ID?: string
  }
}

export type BaseTusHookResponseBody = {
  type: TusHookType
  ok: boolean
}

export type BaseTusHookResponseErrorBody = {
  type: TusHookType
  ok: false
  statusCode: number
  message: string
}

export type TusHookPreCreateResponse = BaseTusHookResponseBody & {
  type: TusHookType.PRE_CREATE
} & (
    | BaseTusHookResponseErrorBody
    | {
        ok: true
      }
  )

export type TusHookPreFinishResponse = BaseTusHookResponseBody & {
  ok: true
  type: TusHookType.PRE_FINISH
  /** File date created in ISO format */
  dateCreated: string
  thumbnailKey?: string
  uploadId: string
  contentType: string
} & Omit<File, 'dateCreated' | 'thumbnailKey' | 'type'>

export type TusHookResponseBody =
  | TusHookPreCreateResponse
  | TusHookPreFinishResponse
