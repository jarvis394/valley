'use client'
import React, { useEffect, useRef, useState } from 'react'
import Button from '../../../components/Button/Button'
import Link from 'next/link'
import styles from './Project.module.css'
import { CloudUpload } from 'geist-ui-icons'
import deburr from 'lodash.deburr'
import { MULTIPART_UPLOAD_CHUNK_SIZE } from '@valley/shared'
import { TUS_URL } from '../../../config/constants'
import Uppy, { Meta, UppyFile } from '@uppy/core'
import { ProgressBar } from '@uppy/react'
import Tus from '@uppy/tus'

const ProjectPage: React.FC = () => {
  const $input = useRef<HTMLInputElement>(null)
  const [uppy] = useState(() =>
    new Uppy({
      autoProceed: false,
      restrictions: {},
    }).use(Tus, {
      endpoint: TUS_URL,
      chunkSize: MULTIPART_UPLOAD_CHUNK_SIZE,
    })
  )

  const handleUploadButtonClick = () => {
    if ($input.current) {
      $input.current.value = ''
      $input.current.click()
    }
  }

  const handleUploadFiles: React.ChangeEventHandler<HTMLInputElement> = async (
    e
  ) => {
    const files = [...e.target.files]
    const fileIds: string[] = []
    let totalSize = 0
    files.forEach((file) => (totalSize += file.size))
    console.log('uploading files:', files)
    console.log('total size:', totalSize)

    files.forEach(async (file) => {
      const fileId = uppy.addFile(file)
      uppy.setFileMeta(fileId, {
        normalizedName: deburr(file.name),
      })
      fileIds.push(fileId)
    })

    const res = await uppy.upload()

    uppy.removeFiles(fileIds)

    console.log('uploaded files:', res)
  }

  useEffect(() => {
    const handleUploadProgress = (
      _file: UppyFile<Meta, Record<string, never>>,
      progress: { bytesUploaded: number; bytesTotal: number }
    ) => {
      console.log(progress.bytesUploaded, progress.bytesTotal)
    }

    uppy.on('upload-progress', handleUploadProgress)

    return () => {
      uppy.off('upload-progress', handleUploadProgress)
    }
  }, [uppy])

  return (
    <div className={styles.project}>
      <Link style={{ textDecoration: 'none' }} href={'/projects'}>
        <Button>Go back</Button>
      </Link>
      <div>
        <Button
          onClick={handleUploadButtonClick}
          variant="primary"
          before={<CloudUpload />}
          size="md"
        >
          Upload file
        </Button>
        <input
          ref={$input}
          multiple
          onChange={handleUploadFiles}
          type="file"
          hidden
        />
        <ProgressBar uppy={uppy} fixed hideAfterFinish />
      </div>
    </div>
  )
}

export default ProjectPage
