'use client'
import { useEffect, useId, useRef, useState } from 'react'
import deburr from 'lodash.deburr'
import { MULTIPART_UPLOAD_CHUNK_SIZE, TusUploadMetadata } from '@valley/shared'
import Uppy, { Meta, UppyFile } from '@uppy/core'
import Tus from '@uppy/tus'
import { TUS_URL } from '../config/constants'
import { getAuthTokens } from '../utils/accessToken'

type UseUploadProps = {
  projectId: number
  folderId: number
}

export const useUpload = ({ projectId, folderId }: UseUploadProps) => {
  const tokens = getAuthTokens()
  const inputId = useId()
  const $root = useRef<HTMLElement>(null)
  const $input = useRef<HTMLInputElement>(document.createElement('input'))
  const uploads = useRef<Map<string, string | null>>(new Map())
  const [uppy] = useState(() =>
    new Uppy({
      autoProceed: false,
      restrictions: {},
    }).use(Tus, {
      endpoint: TUS_URL,
      chunkSize: MULTIPART_UPLOAD_CHUNK_SIZE,
      onSuccess() {
        console.log('uploaded file')
      },
      headers() {
        if (!tokens) return {} as Record<string, string>
        return { Authorization: `Bearer ${tokens.accessToken}` }
      },
      async onAfterResponse(req, res) {
        try {
          const body = res.getBody()
          // const parsedBody = JSON.parse(body || '')

          if (body) {
            // const files = uppy.getFiles()

            // switch (parsedBody.type) {
            //   case '':
            //     break
            // }

            // console.log(req, req.getURL(), res.getUnderlyingObject(), files)
            console.log(JSON.parse(body))
          }
        } catch (e) {
          // console.error(e)
        }
      },
    })
  )

  const uploadFiles = async (fileList: FileList) => {
    const files = [...fileList]
    const fileIds: string[] = []
    let totalSize = 0
    files.forEach((file) => (totalSize += file.size))
    console.log(
      `uploading files to folder ${folderId} in project ${projectId}:`,
      files
    )
    console.log('total size:', totalSize)

    files.forEach(async (file) => {
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
      fileIds.push(fileId)
      uploads.current.set(fileId, null)
    })

    const res = await uppy.upload()

    console.log('uploaded files:', res)
  }

  const handleUploadInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
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
      _file: UppyFile<Meta, Record<string, never>> | undefined,
      progress: { bytesUploaded: number; bytesTotal: number | null }
    ) => {
      console.log(progress.bytesUploaded, progress.bytesTotal)
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
