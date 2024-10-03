'use client'
import React, { useEffect, useId, useRef, useState } from 'react'
import deburr from 'lodash.deburr'
import {
  exhaustivnessCheck,
  FolderGetReq,
  FolderGetRes,
  MAX_UPLOAD_FILE_SIZE,
  MULTIPART_UPLOAD_CHUNK_SIZE,
  TusHookPreFinishResponse,
  TusHookResponseBody,
  TusHookType,
  TusUploadMetadata,
} from '@valley/shared'
import Uppy, { Meta, UppyFile } from '@uppy/core'
import Tus from '@uppy/tus'
import { TUSD_URL } from '../config/constants'
import { getAuthTokens } from '../utils/accessToken'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { HttpRequest, HttpResponse } from 'tus-js-client'
import { Folder, Project } from '@valley/db'
import useSWR from 'swr'
import { api } from '../api'

type Upload = {
  id: string
  normalizedName: string
  filetype: string
  bytesUploaded: number
  totalBytes: number
  progress: number
  uploadError: string | null
  isUploading: boolean
  isUploaded: boolean
}

type UploadsState = {
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

type UploadsAction = {
  setIsUploading: (state: UploadsState['isUploading']) => void
  setFileUploadError: (id: Upload['id'], err: Upload['uploadError']) => void
  addUpload: (
    upload: Pick<Upload, 'id' | 'totalBytes' | 'filetype' | 'normalizedName'>
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

type UseUploadProps = {
  projectId: number
  folderId: number
}

export const useUpload = ({ projectId, folderId }: UseUploadProps) => {
  const { mutate } = useSWR<FolderGetRes, FolderGetReq>(
    '/projects/' + projectId + '/folders/' + folderId,
    api({ isAccessTokenRequired: true })
  )
  const tokens = getAuthTokens()
  const inputId = useId()
  const $root = useRef(null)
  const $input = useRef<HTMLInputElement>(document.createElement('input'))
  const setIsUploading = useUploadsStore((state) => state.setIsUploading)
  const setFolderId = useUploadsStore((state) => state.setFolderId)
  const setProjectId = useUploadsStore((state) => state.setProjectId)
  const addUpload = useUploadsStore((state) => state.addUpload)
  const updateUploadSpeed = useUploadsStore((state) => state.updateUploadSpeed)
  const setFileUploadProgress = useUploadsStore(
    (state) => state.setFileUploadProgress
  )
  const setFileUploadError = useUploadsStore(
    (state) => state.setFileUploadError
  )
  const setFileUploaded = useUploadsStore((state) => state.setFileUploaded)
  const clearSuccessfulUploads = useUploadsStore(
    (state) => state.clearSuccessfulUploads
  )
  const uploadSpeedIntervalID = useRef<NodeJS.Timeout>()

  const getUppyHeaders = (): Record<string, string> => {
    if (!tokens) return {}
    return { Authorization: `Bearer ${tokens.accessToken}` }
  }

  const addUploadedFileToSWRCache = (file: TusHookPreFinishResponse) => {
    const newFile = {
      bucket: file.bucket,
      dateCreated: new Date(file.dateCreated),
      exifMetadata: file.exifMetadata,
      folderId: file.folderId,
      id: file.id,
      key: file.key,
      name: file.name,
      size: file.size,
      thumbnailKey: file.thumbnailKey || null,
      type: file.contentType,
    }

    mutate((data) => {
      if (!data) return undefined
      return {
        ...data,
        files: [...data.files, newFile],
      }
    })
  }

  const handleUploadResponse = async (_req: HttpRequest, res: HttpResponse) => {
    try {
      const body = res.getBody()
      if (!body) return

      const parsedBody = JSON.parse(body) as TusHookResponseBody

      if (body) {
        switch (parsedBody.type) {
          case TusHookType.PRE_CREATE:
            break
          case TusHookType.PRE_FINISH:
            addUploadedFileToSWRCache(parsedBody)
            break
          default:
            exhaustivnessCheck(parsedBody)
        }
      }
    } catch (error) {
      console.warn('Could not parse tus hook response:', {
        error,
        body: res.getBody(),
      })
    }
  }

  const [uppy] = useState(() =>
    new Uppy({
      autoProceed: false,
      restrictions: {
        maxFileSize: MAX_UPLOAD_FILE_SIZE,
      },
      // Allows duplicate files
      onBeforeFileAdded: () => true,
    }).use(Tus, {
      endpoint: TUSD_URL,
      chunkSize: MULTIPART_UPLOAD_CHUNK_SIZE,
      headers: getUppyHeaders,
      onAfterResponse: handleUploadResponse,
    })
  )

  const uploadFiles = async (fileList: FileList) => {
    const files = [...fileList]
    const fileIDs: string[] = []
    let totalSize = 0
    files.forEach((file) => (totalSize += file.size))

    files.forEach(async (file) => {
      const fileId = uppy.addFile(file)
      const metadata: TusUploadMetadata = {
        'normalized-name': deburr(file.name),
        'upload-id': fileId,
        'folder-id': folderId.toString(),
        'project-id': projectId.toString(),
        type: file.type,
      }
      uppy.setFileMeta(fileId, metadata)
      fileIDs.push(fileId)
      addUpload({
        id: fileId,
        totalBytes: file.size,
        filetype: file.type,
        normalizedName: metadata['normalized-name'],
      })
    })

    setIsUploading(true)
    uploadSpeedIntervalID.current = setInterval(() => {
      updateUploadSpeed()
    }, 1000)

    const res = await uppy.upload()

    setIsUploading(false)
    clearInterval(uploadSpeedIntervalID.current)
    uppy.removeFiles(res?.successful?.map((e) => e.id) || [])
  }

  const handleUploadInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    clearSuccessfulUploads()
    uploadFiles(e.target.files)
  }

  const register = <T extends HTMLElement = HTMLElement>(): {
    ref: React.RefObject<T>
    onClick: () => void
  } => {
    return {
      ref: $root,
      onClick: openFilePicker,
    }
  }

  const openFilePicker = () => {
    if ($input.current) {
      $input.current.value = ''
      $input.current.click()
    }
  }

  useEffect(() => {
    const handleUploadProgress = (
      file: UppyFile<Meta, Record<string, never>> | undefined,
      progress: { bytesUploaded: number; bytesTotal: number | null }
    ) => {
      if (!file) return
      setFileUploadProgress(file.id, progress.bytesUploaded)
    }

    const handleUploadError = (
      file: UppyFile<Meta, Record<string, never>> | undefined,
      error: { name: string; message: string; details?: string }
    ) => {
      if (!file) return
      setFileUploadError(file.id, error.message)
    }

    const handleUploadSuccess = (
      file: UppyFile<Meta, Record<string, never>> | undefined,
      response: unknown
    ) => {
      if (!file) return
      console.log({ file, response })
      setFileUploaded(file.id)
    }

    uppy.on('upload-progress', handleUploadProgress)
    uppy.on('upload-error', handleUploadError)
    uppy.on('upload-success', handleUploadSuccess)

    return () => {
      uppy.off('upload-progress', handleUploadProgress)
      uppy.off('upload-error', handleUploadError)
      uppy.off('upload-success', handleUploadSuccess)
    }
  }, [uppy])

  useEffect(() => {
    const handleChange = (e: Event) =>
      handleUploadInputChange(
        e as unknown as React.ChangeEvent<HTMLInputElement>
      )

    document.body.appendChild($input.current)
    $input.current.multiple = true
    $input.current.hidden = true
    $input.current.type = 'file'
    $input.current.id = inputId
    $input.current.addEventListener('change', handleChange)

    setFolderId(folderId)
    setProjectId(projectId)

    return () => {
      $input.current.removeEventListener('change', handleChange)
      $input.current.remove()
    }
    // Should change `handleUploadInputChange` ref as hook props change
  }, [folderId, projectId])

  useEffect(() => {
    return () => {
      clearInterval(uploadSpeedIntervalID.current)
    }
  }, [])

  return {
    uppy,
    uploadFiles,
    register,
    openFilePicker,
  }
}
