'use client'
import React, { useMemo, useRef, useState } from 'react'
import Button from '../../components/Button/Button'
import Link from 'next/link'
import styles from './Project.module.css'
import { CloudUpload } from 'geist-ui-icons'
import splitFileToChunks from '../../utils/splitFileToChunks'
import { API_URL, MULTIPART_UPLOAD_CHUNK_SIZE } from '../../config/constants'
import axios, { AxiosProgressEvent, AxiosResponse } from 'axios'
import {
  FileMultipartUploadChunkRes,
  FileMultipartUploadCompletedPart,
  FileMultipartUploadCompleteReq,
  FileMultipartUploadStartReq,
  FileMultipartUploadStartRes,
} from '@valley/shared'
import deburr from 'lodash.deburr'

const ProjectPage = () => {
  const [filesForUpload, setFilesForUpload] = useState<File[]>([])
  const [totalBytes, setTotalBytes] = useState(0)
  const partsUploadedBytes = useRef({})
  const [uploadedBytes, setUploadedBytes] = useState(0)
  const uploadProgress = useMemo(() => {
    if (totalBytes === 0) return 0
    return Math.floor((uploadedBytes / totalBytes) * 10000) / 100
  }, [uploadedBytes, totalBytes])
  const $input = useRef<HTMLInputElement>(null)

  const handleUploadButtonClick = () => {
    $input.current.click()
  }

  const handleUploadProgress = (
    e: AxiosProgressEvent,
    context: { key: string; part: number }
  ) => {
    let addedUploadedBytes = 0

    if (!partsUploadedBytes.current[context.key]) {
      partsUploadedBytes.current[context.key] = {}
    }

    const partUploadedBytes =
      partsUploadedBytes.current[context.key][context.part]

    if (partUploadedBytes) {
      addedUploadedBytes = e.loaded - partUploadedBytes
    } else {
      addedUploadedBytes = e.loaded
    }

    partsUploadedBytes.current[context.key][context.part] = e.loaded

    setUploadedBytes((prev) => prev + addedUploadedBytes)
  }

  const uploadFile = async (file: File) => {
    const chunks = splitFileToChunks(file, MULTIPART_UPLOAD_CHUNK_SIZE)
    const normalizedName = deburr(file.name)
    console.log('Uploading', normalizedName, 'with size', file.size)

    const startMultipartUploadRequest = await axios.post<
      FileMultipartUploadStartRes,
      AxiosResponse<FileMultipartUploadStartRes>,
      FileMultipartUploadStartReq
    >(API_URL + '/upload/start', {
      chunks: chunks.length,
      filename: file.name, // Still send original filename for server to deburr
      folderId: 1,
      size: file.size,
    })

    const uploadId = startMultipartUploadRequest.data.uploadId
    const uploadRequests: Array<
      Promise<AxiosResponse<FileMultipartUploadChunkRes>>
    > = []

    chunks.forEach(async (chunk) => {
      const headers = {
        'Content-Type': 'application/binary',
        'X-Valley-Upload-Id': uploadId,
        'X-Valley-Part': chunk.part,
        'X-Valley-File-Size': file.size,
        'X-Valley-Part-Size': chunk.blob.size,
      }
      uploadRequests.push(
        axios.post<FileMultipartUploadChunkRes>(
          API_URL + '/upload/chunk',
          chunk.blob,
          {
            headers,
            params: {
              normalizedName: encodeURIComponent(normalizedName),
            },
            onUploadProgress: (e) =>
              handleUploadProgress(e, {
                key: normalizedName,
                part: chunk.part,
              }),
            timeout: 1000 * 60 * 5,
          }
        )
      )
    })

    const uploadResponses = await Promise.all(uploadRequests)
    const parts: FileMultipartUploadCompletedPart[] = uploadResponses.map(
      (e) => ({
        ETag: e.data.etag,
        PartNumber: e.data.part,
      })
    )

    const completeMultipartUploadRequest = await axios.post<
      void,
      void,
      FileMultipartUploadCompleteReq
    >(API_URL + '/upload/complete', {
      uploadId,
      filename: normalizedName,
      parts,
    })

    console.log(completeMultipartUploadRequest)
  }

  const handleUploadFiles: React.ChangeEventHandler<HTMLInputElement> = async (
    e
  ) => {
    const files = [...e.target.files]
    let filesTotalSize = 0
    files.forEach((file) => (filesTotalSize += file.size))

    setFilesForUpload(files)
    setTotalBytes(filesTotalSize)

    const uploadPromises = files.map((file) => uploadFile(file))

    Promise.all(uploadPromises)
  }

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
        <p>Upload progress: {uploadProgress.toString()}</p>
        <p>totalBytes: {totalBytes.toString()}</p>
        <p>uploadedBytes: {uploadedBytes.toString()}</p>
        <div>
          files:
          <br />
          {filesForUpload.map((e, i) => (
            <p key={i}>* {e.name}</p>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProjectPage
