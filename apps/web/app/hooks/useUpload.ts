import { useEffect, useRef, useState } from 'react'
import deburr from 'lodash.deburr'
import { MULTIPART_UPLOAD_CHUNK_SIZE } from '@valley/shared'
import Uppy, { Meta, UppyFile } from '@uppy/core'
import Tus from '@uppy/tus'
import { TUS_URL } from '../config/constants'

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>

export const useUpload = () => {
  const $input = useRef<HTMLInputElement>(null)
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
      async onAfterResponse(req, res) {
        const body = res.getBody()
        const parsedBody = JSON.parse(body || '')

        if (body) {
          const files = uppy.getFiles()

          switch (parsedBody.type) {
            case '':
          }

          console.log(req, req.getURL(), res.getUnderlyingObject(), files)
          console.log(JSON.parse(body))
        }
      },
    })
  )

  const uploadFiles = async (fileList: FileList) => {
    const files = [...fileList]
    const fileIds: string[] = []
    let totalSize = 0
    files.forEach((file) => (totalSize += file.size))
    console.log('uploading files:', files)
    console.log('total size:', totalSize)

    files.forEach(async (file) => {
      const fileId = uppy.addFile(file)
      uppy.setFileMeta(fileId, {
        normalizedName: deburr(file.name),
        uploadId: fileId,
      })
      fileIds.push(fileId)
      uploads.current.set(fileId, null)
    })

    const res = await uppy.upload()

    console.log('uploaded files:', res)
  }

  const handleUploadInputChange: React.ChangeEventHandler<HTMLInputElement> = (
    e
  ) => {
    if (!e.target.files) return
    uploadFiles(e.target.files)
  }

  const register = (props: InputProps = {}): InputProps => {
    return {
      // Overridable props
      multiple: true,
      hidden: true,
      ...props,
      // Non-overridable props
      type: 'file',
      ref: $input,
      onChange: handleUploadInputChange,
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

  return { uppy, uploadFiles, register, openFilePicker }
}
