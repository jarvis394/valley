import type { Folder, Project } from '@valley/db'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type Upload = {
  id: string
  name: string
  filetype: string
  bytesUploaded: number
  totalBytes: number
  progress: number
  uploadError: string | null
  isUploading: boolean
  isUploaded: boolean
}

export type UploadsState = {
  uploads: Record<string, Upload>
  uploadsCount: number
  totalBytes: number
  bytesUploaded: number
  /** Bytes in second */
  uploadSpeed: number
  /** Unix timestamp of last execution of setUploadProgress */
  lastUploadProgressTimestamp: number
  lastBytesUploaded: number
  /** Upload remaining time based on upload speed in seconds */
  remainingTime: number
  uploadSpeedIntervalID: NodeJS.Timeout | null
  isUploading: boolean
  folderId: Folder['id'] | null
  projectId: Project['id'] | null
}

export type UploadsAction = {
  setIsUploading: (state: UploadsState['isUploading']) => void
  setFileUploadError: (id: Upload['id'], err: Upload['uploadError']) => void
  addUpload: (
    upload: Pick<Upload, 'id' | 'totalBytes' | 'filetype' | 'name'>
  ) => void
  setFileUploadProgress: (
    id: Upload['id'],
    bytesUploaded: Upload['bytesUploaded']
  ) => void
  setFileUploaded: (id: Upload['id']) => void
  clearSuccessfulUploads: () => void
  setFolderId: (id: UploadsState['folderId']) => void
  setProjectId: (id: UploadsState['projectId']) => void
  setUploadSpeed: (uploadSpeed: UploadsState['uploadSpeed']) => void
  updateUploadSpeed: () => void
}

export const useUploadsStore = create<UploadsState & UploadsAction>()(
  immer((set) => ({
    uploads: {},
    uploadsCount: 0,
    totalBytes: 0,
    bytesUploaded: 0,
    uploadSpeed: 0,
    lastBytesUploaded: 0,
    lastUploadProgressTimestamp: 0,
    remainingTime: 0,
    isUploading: false,
    folderId: null,
    projectId: null,
    uploadSpeedIntervalID: null,
    updateUploadSpeed: () =>
      set((state) => {
        state.uploadSpeed = state.bytesUploaded - state.lastBytesUploaded
        state.lastBytesUploaded = state.bytesUploaded
        state.remainingTime =
          (state.totalBytes - state.bytesUploaded) / state.uploadSpeed
      }),
    setIsUploading: (newIsUploading) =>
      set((state) => {
        state.isUploading = newIsUploading
      }),
    setFolderId: (id) =>
      set((state) => {
        state.folderId = id
      }),
    setUploadSpeed: (uploadSpeed) =>
      set((state) => {
        state.uploadSpeed = uploadSpeed
      }),
    setProjectId: (id) =>
      set((state) => {
        state.projectId = id
      }),
    setFileUploadError: (id, err) =>
      set((state) => {
        if (!state.uploads[id]) {
          throw new Error(
            `Cannot set upload error to an unknown upload, got: ${id}`
          )
        }

        state.uploads[id].isUploading = false
        state.uploads[id].isUploaded = false
        state.uploads[id].uploadError = err
      }),
    addUpload: (upload) =>
      set((state) => {
        state.uploads[upload.id] = {
          ...upload,
          bytesUploaded: 0,
          isUploaded: false,
          isUploading: true,
          progress: 0,
          uploadError: null,
        }
        state.uploadsCount += 1
        state.totalBytes += upload.totalBytes
      }),
    setFileUploadProgress: (id, bytesUploaded) =>
      set((state) => {
        const upload = state.uploads[id]
        if (!upload) {
          throw new Error(
            `Cannot set upload progress of an unknown upload, got: ${id}`
          )
        }

        const prevBytesUploaded = upload.bytesUploaded
        const progress = bytesUploaded / upload.totalBytes
        state.uploads[id].uploadError = null
        state.uploads[id].isUploading = true
        state.uploads[id].bytesUploaded = bytesUploaded
        state.uploads[id].progress = progress
        state.uploads[id].isUploaded = false
        state.bytesUploaded += bytesUploaded - prevBytesUploaded
      }),
    setFileUploaded: (id) =>
      set((state) => {
        if (!state.uploads[id]) {
          throw new Error(
            `Cannot set upload progress of an unknown upload, got: ${id}`
          )
        }

        state.uploads[id].uploadError = null
        state.uploads[id].isUploaded = true
        state.uploads[id].isUploading = false
      }),
    clearSuccessfulUploads: () =>
      set((state) => {
        const erroredUploads: UploadsState['uploads'] = {}
        let erroredUploadsCount = 0
        let erroredUploadsTotalBytes = 0
        let erroredUploadsBytesUploaded = 0

        for (const id of Object.keys(state.uploads)) {
          if (state.uploads[id].uploadError) {
            erroredUploads[id] = state.uploads[id]
            erroredUploadsCount += 1
            erroredUploadsTotalBytes += state.uploads[id].totalBytes
            erroredUploadsBytesUploaded += state.uploads[id].bytesUploaded
          }
        }

        state.isUploading = false
        state.uploads = erroredUploads
        state.uploadsCount = erroredUploadsCount
        state.totalBytes = erroredUploadsTotalBytes
        state.bytesUploaded = erroredUploadsBytesUploaded
      }),
  }))
)
