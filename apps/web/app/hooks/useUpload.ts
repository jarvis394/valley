'use client'
import { useEffect, useId, useRef, useState } from 'react'
import deburr from 'lodash.deburr'
import { MULTIPART_UPLOAD_CHUNK_SIZE, TusUploadMetadata } from '@valley/shared'
import Uppy, { Meta, UppyFile } from '@uppy/core'
import Tus from '@uppy/tus'
import { TUS_URL } from '../config/constants'
import { getAuthTokens } from '../utils/accessToken'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { HttpRequest, HttpResponse } from 'tus-js-client'
import { Folder, Project } from '@valley/db'

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
  isUploading: boolean
  folderId: Folder['id'] | null
  projectId: Project['id'] | null
}

type UploadsAction = {
  setIsUploading: (state: UploadsState['isUploading']) => void
  setUploadError: (id: Upload['id'], err: Upload['uploadError']) => void
  addUpload: (
    upload: Pick<Upload, 'id' | 'totalBytes' | 'filetype' | 'normalizedName'>
  ) => void
  setUploadProgress: (
    id: Upload['id'],
    bytesUploaded: Upload['bytesUploaded']
  ) => void
  clearSuccessfulUploads: () => void
  setFolderId: (id: UploadsState['folderId']) => void
  setProjectId: (id: UploadsState['projectId']) => void
}

export const useUploadsStore = create<UploadsState & UploadsAction>()(
  immer((set) => ({
    uploads: {},
    uploadsCount: 0,
    totalBytes: 0,
    bytesUploaded: 0,
    isUploading: false,
    folderId: null,
    projectId: null,
    setIsUploading: (newIsUploading) =>
      set((state) => {
        state.isUploading = newIsUploading
      }),
    setFolderId: (id) =>
      set((state) => {
        state.folderId = id
      }),
    setProjectId: (id) =>
      set((state) => {
        state.projectId = id
      }),
    setUploadError: (id, err) =>
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
    setUploadProgress: (id, bytesUploaded) =>
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
        state.uploads[id].isUploaded = progress >= 1
        state.bytesUploaded += bytesUploaded - prevBytesUploaded
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
  const tokens = getAuthTokens()
  const inputId = useId()
  const $root = useRef<HTMLElement>(null)
  const $input = useRef<HTMLInputElement>(document.createElement('input'))
  const setIsUploading = useUploadsStore((state) => state.setIsUploading)
  const setFolderId = useUploadsStore((state) => state.setFolderId)
  const setProjectId = useUploadsStore((state) => state.setProjectId)
  const addUpload = useUploadsStore((state) => state.addUpload)
  const setUploadProgress = useUploadsStore((state) => state.setUploadProgress)
  const clearSuccessfulUploads = useUploadsStore(
    (state) => state.clearSuccessfulUploads
  )

  const getUppyHeaders = () => {
    if (!tokens) return {} as Record<string, string>
    return { Authorization: `Bearer ${tokens.accessToken}` }
  }

  const handleUploadResponse = async (_req: HttpRequest, res: HttpResponse) => {
    try {
      const body = res.getBody()
      // const parsedBody = JSON.parse(body || '')

      if (body) {
        // const files = uppy.getFiles()

        // switch (parsedBody.type) {
        //   case '':
        //     break
        // }
        console.log(JSON.parse(body))
      }
    } catch (e) {
      // console.error(e)
    }
  }

  const [uppy] = useState(() =>
    new Uppy({
      autoProceed: false,
      restrictions: {},
    }).use(Tus, {
      endpoint: TUS_URL,
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
    console.log(
      `uploading files to folder ${folderId} in project ${projectId}:`,
      files
    )
    console.log('total size:', totalSize)

    files.forEach((file) => {
      const fileId = uppy.addFile(file)
      const metadata: TusUploadMetadata = {
        'normalized-name': deburr(file.name),
        'upload-id': fileId,
        'folder-id': folderId.toString(),
        'project-id': projectId.toString(),
        name: file.name,
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
    const res = await uppy.upload()
    setIsUploading(false)

    uppy.removeFiles(fileIDs)

    console.log('uploaded files:', res)
  }

  const handleUploadInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    clearSuccessfulUploads()
    uploadFiles(e.target.files)
  }

  const register = () => {
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
      setUploadProgress(file.id, progress.bytesUploaded)
    }

    uppy.on('upload-progress', handleUploadProgress)

    return () => {
      uppy.off('upload-progress', handleUploadProgress)
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

  return {
    uppy,
    uploadFiles,
    register,
    openFilePicker,
  }
}
