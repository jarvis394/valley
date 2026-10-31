import { projectSettingsSchema } from '../core/settings'
import { parseDocument } from '../registry/parse'
import type { Editor } from './editor'

const SAVE_DELAY_MS = 300

/**
 * Restores the editor from `storage[key]` (document) and `storage[key.settings]`, then
 * autosaves on change. Saves are debounced because drags and typing emit per event; pending
 * writes flush on `pagehide`.
 */
export function persistEditor(editor: Editor, key: string, storage: Storage = localStorage) {
  const settingsKey = `${key}.settings`
  const stored = storage.getItem(key)
  if (stored) {
    try {
      const { doc, warnings } = parseDocument(JSON.parse(stored), editor.registry)
      warnings.forEach((warning) => console.warn(warning))
      editor.load(doc)
    } catch (error) {
      console.warn('Discarding invalid stored document', error)
    }
  }
  const storedSettings = storage.getItem(settingsKey)
  if (storedSettings) {
    try {
      editor.store.setState({ settings: projectSettingsSchema.parse(JSON.parse(storedSettings)) })
    } catch (error) {
      console.warn('Discarding invalid stored settings', error)
    }
  }

  let timer: ReturnType<typeof setTimeout> | undefined
  const flush = () => {
    if (timer === undefined) return
    clearTimeout(timer)
    timer = undefined
    const { doc, settings } = editor.getState()
    try {
      storage.setItem(key, JSON.stringify(doc))
      storage.setItem(settingsKey, JSON.stringify(settings))
    } catch (error) {
      console.warn('Could not save the document', error)
    }
  }
  const schedule = () => {
    clearTimeout(timer)
    timer = setTimeout(flush, SAVE_DELAY_MS)
  }
  const unsubscribeDoc = editor.subscribe(schedule)
  const unsubscribeSettings = editor.store.subscribe((state, prev) => {
    if (state.settings !== prev.settings) schedule()
  })
  addEventListener('pagehide', flush)

  return () => {
    flush()
    unsubscribeDoc()
    unsubscribeSettings()
    removeEventListener('pagehide', flush)
  }
}
