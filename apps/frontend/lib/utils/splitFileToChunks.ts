export interface Chunk {
  part: number
  blob: Blob
}

const splitFileToChunks = (file: File, chunkSize: number): Chunk[] => {
  const size: number = file.size
  const result: Chunk[] = []
  let sliceEndIndex = 0
  let partNumber = 1
  let index = 0

  while (index < size) {
    sliceEndIndex = index + chunkSize

    if (sliceEndIndex + chunkSize > size) {
      sliceEndIndex = size
    }

    result.push({
      part: partNumber++,
      blob: file.slice(index, sliceEndIndex),
    })
    index = sliceEndIndex
  }

  return result
}

export default splitFileToChunks
