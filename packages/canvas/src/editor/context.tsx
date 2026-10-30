import { createContext, use, useCallback, type ReactNode } from 'react'
import { useStore } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import type { BlockProps, BlockType } from '../core/document'
import type { AssetId, NodeId } from '../core/ids'
import type { UpdateProps } from '../registry/types'
import type { Editor, EditorState } from './editor'

const EditorContext = createContext<Editor | null>(null)

export function EditorProvider({ editor, children }: { editor: Editor; children: ReactNode }) {
  return <EditorContext value={editor}>{children}</EditorContext>
}

export function useEditor(): Editor {
  const editor = use(EditorContext)
  if (!editor) throw new Error('useEditor must be used inside <EditorProvider>')
  return editor
}

/** Selectors must return stable references (immer structural sharing gives us that). */
export const useEditorState = <T,>(selector: (state: EditorState) => T): T =>
  useStore(useEditor().store, selector)

export const useDocument = () => useEditorState((state) => state.doc)
export const useNode = (id: NodeId) => useEditorState((state) => state.doc.nodes[id])
export const useTheme = () => useEditorState((state) => state.doc.theme)
export const useMeta = () => useEditorState((state) => state.doc.meta)
export const useAssets = () => useEditorState((state) => state.doc.assets)
export const useAsset = (id: AssetId | null | undefined) =>
  useEditorState((state) => (id ? state.doc.assets[id] : undefined))
export const useSelectedId = () => useEditorState((state) => state.selectedId)
export const useMode = () => useEditorState((state) => state.mode)

/** A props updater scoped to one node, passed to blocks as `update`. */
export function useUpdateProps<T extends BlockType>(id: NodeId): UpdateProps<BlockProps<T>> {
  const editor = useEditor()
  return useCallback(
    (recipe, options) => void editor.commands.updateProps<T>(id, recipe, options),
    [editor, id],
  )
}

/** Child ids of a container split by placement mode. Each list is shallow-compared. */
export function useChildIds(parentId: NodeId) {
  const store = useEditor().store
  const select = (mode: 'flow' | 'absolute') => (state: EditorState) =>
    (state.doc.nodes[parentId]?.children ?? []).filter(
      (id) => state.doc.nodes[id]?.placement.mode === mode,
    )
  const flow = useStore(store, useShallow(select('flow')))
  const absolute = useStore(store, useShallow(select('absolute')))
  return { flow, absolute }
}
