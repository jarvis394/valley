import { createEditor } from '@valley/canvas'
import { registry } from '../lib/registry'
import * as backend from './backend'
import type { ValleyApi } from './types'
import { uploadAssetTo } from './uploads'

export type * from './types'

const SAVE_DELAY_MS = 600

/**
 * Lets a save outlive the page. Browsers cap keepalive bodies at 64 KB, so a larger document
 * falls back to a plain request, which may not finish.
 */
const keepaliveFetch = (input: RequestInfo | URL, init?: RequestInit) =>
  fetch(input, { ...init, keepalive: true }).catch(() => fetch(input, init))

/** The app's single data source: TanStack Start server functions over `@valley/backend`. */
export const api: ValleyApi = {
  getAccount: () => backend.getAccount(),

  listProjects: () => backend.listProjects(),

  getProject: (id) => backend.getProject({ data: id }),

  async createProject(files) {
    const project = await backend.createProject({
      data: { title: 'Untitled project', date: new Date().toISOString().slice(0, 10) },
    })
    const editor = createEditor({
      doc: project.doc,
      settings: project.settings,
      registry,
      uploadAsset: uploadAssetTo(project.id),
    })
    await editor.commands.insertFiles(files)
    const { doc, settings } = editor.getState()
    await backend.saveProject({ data: { id: project.id, doc, settings } })

    return {
      ...project,
      files: Object.keys(doc.assets).length,
      thumbnail: registry.thumbnailOf(doc),
    }
  },

  uploadAsset: uploadAssetTo,

  syncProject(id, editor) {
    let timer: ReturnType<typeof setTimeout> | undefined
    let saving = Promise.resolve()

    const save = (fetcher?: typeof keepaliveFetch) => {
      const { doc, settings } = editor.getState()

      return backend
        .saveProject({ data: { id, doc, settings }, fetch: fetcher })
        .then(({ slugError }) => {
          if (slugError) console.warn(slugError)
        })
        .catch((error: unknown) => console.error('Could not save the project', error))
    }
    // Leaving the page skips the queue: the page may be gone before queued saves run.
    const flush = (leaving = false) => {
      if (timer === undefined) return
      clearTimeout(timer)
      timer = undefined
      saving = leaving ? save(keepaliveFetch) : saving.then(() => save())
    }
    const schedule = () => {
      clearTimeout(timer)
      timer = setTimeout(flush, SAVE_DELAY_MS)
    }
    const flushWhenHidden = () => {
      if (document.visibilityState === 'hidden') flush(true)
    }
    const flushOnLeave = () => flush(true)

    const stopDoc = editor.subscribe(schedule)
    const stopSettings = editor.store.subscribe((state, prev) => {
      if (state.settings !== prev.settings) schedule()
    })
    document.addEventListener('visibilitychange', flushWhenHidden)
    addEventListener('pagehide', flushOnLeave)

    return () => {
      flush()
      stopDoc()
      stopSettings()
      document.removeEventListener('visibilitychange', flushWhenHidden)
      removeEventListener('pagehide', flushOnLeave)
    }
  },
}
