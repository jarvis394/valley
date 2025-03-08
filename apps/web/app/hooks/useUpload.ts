import React, { useCallback, useEffect, useId, useRef, useState } from 'react'
import deburr from 'lodash.deburr'
import {
  exhaustivnessCheck,
  MAX_UPLOAD_FILE_SIZE,
  MULTIPART_UPLOAD_CHUNK_SIZE,
  TusHookPreFinishResponse,
  TusHookResponseBody,
  TusHookType,
  TusUploadMetadata,
} from '@valley/shared'
import Uppy, { Meta, UppyFile } from '@uppy/core'
import Tus from '@uppy/tus'
import { HttpRequest, HttpResponse } from 'tus-js-client'
import type { Folder, Project } from '@valley/db'
import { useRevalidator } from '@remix-run/react'
import { useRootLoaderData } from 'app/root'
import { useUploadsStore } from 'app/stores/uploads'
import { invalidateCache } from 'app/utils/cache'
import { getFolderCacheKey } from 'app/routes/_user+/projects_.$projectId+/folder.$folderId'
import { getProjectCacheKey } from 'app/routes/_user+/projects_.$projectId+/_layout'
import { useProjectsStore } from 'app/stores/projects'
import { parseCookies } from 'app/utils/misc'

const isClientSide = typeof document !== 'undefined'

type UseUploadProps = {
  projectId: Project['id']
  folderId: Folder['id']
}

export const useUpload = ({ projectId, folderId }: UseUploadProps) => {
  const inputId = useId()
  const revalidator = useRevalidator()
  const rootContext = useRootLoaderData()
  const $root = useRef<HTMLElement>(null)
  const $input = useRef<HTMLInputElement>(
    isClientSide ? document.createElement('input') : null
  )
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
  const addFileToCache = useProjectsStore((state) => state.addFile)
  const uploadSpeedIntervalID = useRef<NodeJS.Timeout>(undefined)

  const addUploadedFileToCache = async (file: TusHookPreFinishResponse) => {
    console.log('Adding file to cache:', file)

    await invalidateCache([
      getProjectCacheKey(file.data.projectId!),
      getFolderCacheKey(file.data.folderId!),
    ])

    try {
      revalidator.revalidate()
      addFileToCache({
        projectId: file.data.projectId!,
        folderId: file.data.folderId!,
        file: {
          ...file.data,
          dateCreated: new Date(file.data.dateCreated),
          height: file.data.height || null,
          width: file.data.width || null,
        },
      })
    } catch (e) {
      console.error('Got an error on cache update:', e)
    }
  }

  const handleUploadResponse = async (_req: HttpRequest, res: HttpResponse) => {
    try {
      const body = res.getBody()
      if (!body) return

      const parsedBody = JSON.parse(body) as TusHookResponseBody

      if (body) {
        if (!parsedBody.ok) return
        switch (parsedBody.type) {
          case TusHookType.PRE_CREATE:
            break
          case TusHookType.PRE_FINISH:
            await addUploadedFileToCache(parsedBody)
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
      onBeforeUpload(files) {
        console.log(files)
        return files
      },
    }).use(Tus, {
      endpoint: rootContext?.ENV.TUSD_URL,
      chunkSize: MULTIPART_UPLOAD_CHUNK_SIZE,
      onBeforeRequest(req) {
        const cookies = parseCookies()
        const session = cookies['valley_session']
        req.setHeader('Authorization', session)
      },
      onAfterResponse: handleUploadResponse,
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      withCredentials: true,
    })
  )

  const uploadFiles = useCallback(
    async (fileList: FileList) => {
      const files = [...fileList]
      const fileIDs: string[] = []

      files.forEach(async (file) => {
        const fileId = uppy.addFile(file)
        const metadata: TusUploadMetadata = {
          'folder-id': folderId,
          'project-id': projectId,
          type: file.type,
          name: deburr(file.name.trim()),
        }
        uppy.setFileMeta(fileId, metadata)
        fileIDs.push(fileId)
        addUpload({
          id: fileId,
          totalBytes: file.size,
          filetype: file.type,
          name: metadata.name,
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
    },
    [addUpload, folderId, projectId, setIsUploading, updateUploadSpeed, uppy]
  )

  const handleUploadInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return
      clearSuccessfulUploads()
      uploadFiles(e.target.files)
    },
    [clearSuccessfulUploads, uploadFiles]
  )

  const register = <T extends HTMLElement = HTMLElement>(): {
    ref: React.RefObject<T>
    onClick: () => void
  } => {
    return {
      ref: $root as React.RefObject<T>,
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
  }, [setFileUploadError, setFileUploadProgress, setFileUploaded, uppy])

  useEffect(() => {
    const handleChange = (e: Event) =>
      handleUploadInputChange(
        e as unknown as React.ChangeEvent<HTMLInputElement>
      )

    if (!$input.current || !$root.current) return

    isClientSide && $root.current.appendChild($input.current)
    $input.current.multiple = true
    $input.current.hidden = true
    $input.current.type = 'file'
    $input.current.id = inputId
    $input.current.addEventListener('change', handleChange)

    setFolderId(folderId)
    setProjectId(projectId)

    const inputRef = $input.current

    return () => {
      inputRef.removeEventListener('change', handleChange)
      inputRef.remove()
    }
    // Should change `handleUploadInputChange` ref as hook props change
  }, [
    folderId,
    handleUploadInputChange,
    inputId,
    projectId,
    setFolderId,
    setProjectId,
  ])

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
