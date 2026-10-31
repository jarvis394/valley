import type { Asset } from '../core/document'

export type ReadAsset = (file: File) => Promise<Omit<Asset, 'id'>>

/** Default `uploadAsset`: keeps the file in the tab as an object URL. */
export async function readLocalAsset(file: File): Promise<Omit<Asset, 'id'>> {
  // Object URLs only live as long as the tab. A real implementation uploads first.
  const src = URL.createObjectURL(file)
  const kind = file.type.startsWith('video/') ? 'video' : 'image'
  const { width, height } = await new Promise<{ width: number; height: number }>((resolve) => {
    if (kind === 'video') {
      const video = document.createElement('video')
      video.addEventListener('loadedmetadata', () =>
        resolve({ width: video.videoWidth, height: video.videoHeight }),
      )
      video.addEventListener('error', () => resolve({ width: 16, height: 9 }))
      video.src = src
    } else {
      const image = new Image()
      image.addEventListener('load', () =>
        resolve({ width: image.naturalWidth, height: image.naturalHeight }),
      )
      image.addEventListener('error', () => resolve({ width: 1, height: 1 }))
      image.src = src
    }
  })
  return { kind, name: file.name, src, width, height, size: file.size }
}
