import { useEffect } from 'react'
import type { Editor } from './editor'

const isEditingText = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))

export function useEditorHotkeys(editor: Editor) {
  // oxlint-disable-next-line valley/no-unreasoned-state-sync -- keeps a window keydown listener for editor shortcuts
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey
      const key = event.key.toLowerCase()
      const { selectedId, mode } = editor.getState()
      if (key === '\\' && !mod && !isEditingText(event.target)) {
        event.preventDefault()
        editor.setMode(mode === 'edit' ? 'preview' : 'edit')
        return
      }
      if (mode !== 'edit') return

      // Undo and redo use the store's history even in text fields, since every edit goes through the store.
      if (mod && key === 'z') {
        event.preventDefault()
        if (event.shiftKey) editor.redo()
        else editor.undo()
        return
      }
      if (mod && key === 'y') {
        event.preventDefault()
        editor.redo()
        return
      }
      if (isEditingText(event.target)) return

      if (key === 'escape') editor.select(null)
      if (!selectedId) return
      if (key === 'backspace' || key === 'delete') {
        event.preventDefault()
        editor.commands.removeNode(selectedId)
      }
      if (mod && key === 'd') {
        event.preventDefault()
        editor.commands.duplicateNode(selectedId)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [editor])
}
