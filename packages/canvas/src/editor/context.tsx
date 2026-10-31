import { createContext, use, useCallback, useState, type ReactNode } from 'react'
import { useStore } from 'zustand'
import type { BlockProps, BlockType } from '../core/document'
import type { NodeId } from '../core/ids'
import type { UpdateProps } from '../registry/types'
import { RenderProvider, type RenderContextValue } from '../render/context'
import type { Editor, EditorState } from './editor'

const EditorContext = createContext<Editor | null>(null)

/** Provides the editor, and the render context its blocks read from. */
export function EditorProvider({ editor, children }: { editor: Editor; children: ReactNode }) {
  const [render] = useState<RenderContextValue>(() => ({
    store: editor.store,
    registry: editor.registry,
    uploadAssets: editor.readOnly ? undefined : editor.commands.uploadAssets,
  }))
  return (
    <EditorContext value={editor}>
      <RenderProvider value={render}>{children}</RenderProvider>
    </EditorContext>
  )
}

export function useEditor(): Editor {
  const editor = use(EditorContext)
  if (!editor) throw new Error('useEditor must be used inside <EditorProvider>')
  return editor
}

/** Selectors must return stable references (immer structural sharing gives us that). */
export const useEditorState = <T,>(selector: (state: EditorState) => T): T =>
  useStore(useEditor().store, selector)

export const useSelectedId = () => useEditorState((state) => state.selectedId)
export const useMode = () => useEditorState((state) => state.mode)
export const useSettings = () => useEditorState((state) => state.settings)

/** A props updater scoped to one node, passed to blocks as `update`. */
export function useUpdateProps<T extends BlockType>(id: NodeId): UpdateProps<BlockProps<T>> {
  const editor = useEditor()
  return useCallback(
    (recipe, options) => void editor.commands.updateProps<T>(id, recipe, options),
    [editor, id],
  )
}
