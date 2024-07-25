export const maxFileSize = 104857600
export const multipartUploadChunkSize = 5242880

const splitFileToChunks = (blob: Blob, chunkSize: number) => {
  const blobSize: number = blob.size
  const result: Array<{ part: number; blob: Blob }> = []
  let sliceEndIndex = 0
  let partNumber = 1
  let index = 0

  while (index < blobSize) {
    sliceEndIndex = index + chunkSize

    if (sliceEndIndex + chunkSize > blobSize) {
      sliceEndIndex = blobSize
    }

    result.push({ part: partNumber++, blob: blob.slice(index, sliceEndIndex) })
    index = sliceEndIndex
  }

  return result
}

export default splitFileToChunks
