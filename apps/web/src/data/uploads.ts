import { readLocalAsset, type ReadAsset } from '@valley/canvas'
import { Upload } from 'tus-js-client'
import type { UploadedAsset } from '@valley/backend'
import { UPLOADS_PATH } from '../config/routes'
const CHUNK_SIZE = 16 * 1024 * 1024
const PARALLEL_UPLOADS = 4

/** Limits how many files upload at once; a drop of hundreds would otherwise open as many requests. */
function createLimiter(size: number) {
  let active = 0
  const queue: (() => void)[] = []

  const release = () => {
    active -= 1
    queue.shift()?.()
  }

  return async <T>(task: () => Promise<T>) => {
    if (active >= size) await new Promise<void>((resolve) => queue.push(resolve))
    active += 1

    return task().finally(release)
  }
}

const limit = createLimiter(PARALLEL_UPLOADS)

/** The browser's measurements, for formats it can open. The server measures images again. */
async function measure(file: File): Promise<Record<string, string>> {
  if (!/^(image|video)\//.test(file.type)) return {}
  const local = await readLocalAsset(file)
  URL.revokeObjectURL(local.src)

  return { width: String(local.width), height: String(local.height) }
}

function upload(file: File, projectId: string, metadata: Record<string, string>) {
  return new Promise<UploadedAsset>((resolve, reject) => {
    let body: string | undefined
    const task = new Upload(file, {
      endpoint: UPLOADS_PATH,
      chunkSize: CHUNK_SIZE,
      retryDelays: [0, 1000, 3000, 5000, 10_000],
      removeFingerprintOnSuccess: true,
      metadata,
      // Per project, so the same file dropped into another project doesn't resume this upload.
      fingerprint: async () =>
        ['valley', projectId, file.name, file.type, file.size, file.lastModified].join(':'),
      // The server answers the final chunk with the stored asset.
      onAfterResponse(_request, response) {
        if (response.getStatus() === 200 && response.getBody()) body = response.getBody()
      },
      onSuccess() {
        if (body) resolve(JSON.parse(body) as UploadedAsset)
        else reject(new Error(`Upload of ${file.name} finished without an asset`))
      },
      onError: reject,
    })

    void task.findPreviousUploads().then((previous) => {
      if (previous[0]) task.resumeFromPreviousUpload(previous[0])
      task.start()
    }, reject)
  })
}

/** `uploadAsset` for the editor: stores files in project `projectId` through tus. */
export const uploadAssetTo =
  (projectId: string): ReadAsset =>
  (file) =>
    limit(async () => {
      const size = await measure(file)

      return upload(file, projectId, {
        projectId,
        name: file.name,
        contentType: file.type,
        ...size,
      })
    })
