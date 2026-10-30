import { parseDocument } from '../registry/parse'
import type { Editor } from './editor'

const SAVE_DELAY_MS = 300

/**
 * Restores the editor from `storage[key]`, then autosaves on change. Saves are debounced
 * because drags and typing emit per event; pending writes flush on `pagehide`.
 */
export function persistEditor(editor: Editor, key: string, storage: Storage = localStorage) {
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

  let timer: ReturnType<typeof setTimeout> | undefined
  const flush = () => {
    if (timer === undefined) return
    clearTimeout(timer)
    timer = undefined
    storage.setItem(key, JSON.stringify(editor.getState().doc))
  }
  const unsubscribe = editor.subscribe(() => {
    clearTimeout(timer)
    timer = setTimeout(flush, SAVE_DELAY_MS)
  })
  addEventListener('pagehide', flush)

  return () => {
    flush()
    unsubscribe()
    removeEventListener('pagehide', flush)
  }
}
