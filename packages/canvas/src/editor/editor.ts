import { applyPatches, enablePatches, produceWithPatches, type Draft, type Patch } from 'immer'
import { createStore } from 'zustand/vanilla'
import type { Asset, BlockProps, BlockType, CanvasDocument, DocumentMeta } from '../core/document'
import { createAssetId, type AssetId, type NodeId } from '../core/ids'
import * as ops from '../core/operations'
import type { Placement } from '../core/placement'
import type { Theme } from '../core/theme'
import { findNode, getNode } from '../core/tree'
import type { BlockRegistry } from '../registry/registry'
import type { UpdateOptions } from '../registry/types'

enablePatches()

export type EditorMode = 'edit' | 'preview'

interface HistoryEntry {
  patches: Patch[]
  inverse: Patch[]
  mergeKey?: string
  at: number
}

export interface EditorState {
  doc: CanvasDocument
  selectedId: NodeId | null
  /** Where a dragged block would land. Transient UI state, never part of history. */
  drop: DropTarget | null
  mode: EditorMode
  past: HistoryEntry[]
  future: HistoryEntry[]
}

export interface DropTarget {
  parentId: NodeId
  /** Insertion index among the parent's flow children, counted before the source is removed. */
  index: number
}

export type ChangeOrigin = 'local' | 'undo' | 'redo' | 'load'

/**
 * The editor emits every document change as immer patches. Patches are plain JSON,
 * so persistence, autosave and sync can consume them.
 */
export type ChangeListener = (change: {
  doc: CanvasDocument
  patches: Patch[]
  origin: ChangeOrigin
}) => void

export interface CreateEditorOptions {
  doc: CanvasDocument
  registry: BlockRegistry
  readOnly?: boolean
  /** Origin of published galleries; a project lives at `${galleryUrl}/${slug}`. */
  galleryUrl?: string
}

const MERGE_WINDOW_MS = 1000
const HISTORY_LIMIT = 200

export function createEditor({
  doc: initialDoc,
  registry,
  readOnly = false,
  galleryUrl,
}: CreateEditorOptions) {
  const store = createStore<EditorState>(() => ({
    doc: initialDoc,
    selectedId: null,
    drop: null,
    mode: readOnly ? 'preview' : 'edit',
    past: [],
    future: [],
  }))
  const listeners = new Set<ChangeListener>()
  const emit: ChangeListener = (change) => listeners.forEach((listener) => listener(change))

  /** The single write path for the document. Returns false if the recipe threw. */
  function transact(
    recipe: (draft: CanvasDocument) => void,
    { mergeKey }: UpdateOptions = {},
  ): boolean {
    if (readOnly) return false
    const state = store.getState()
    let result: readonly [CanvasDocument, Patch[], Patch[]]
    try {
      result = produceWithPatches(state.doc, (draft: Draft<CanvasDocument>) =>
        recipe(draft as CanvasDocument),
      )
    } catch (error) {
      if (error instanceof ops.CanvasOperationError) {
        console.warn(`[canvas] ${error.message}`)
        return false
      }
      throw error
    }
    const [next, patches, inverse] = result
    if (patches.length === 0) return true

    const now = Date.now()
    const last = state.past.at(-1)
    const past =
      mergeKey && last?.mergeKey === mergeKey && now - last.at < MERGE_WINDOW_MS
        ? [
            ...state.past.slice(0, -1),
            {
              patches: [...last.patches, ...patches],
              inverse: [...inverse, ...last.inverse],
              mergeKey,
              at: now,
            },
          ]
        : [...state.past, { patches, inverse, mergeKey, at: now }].slice(-HISTORY_LIMIT)

    store.setState({ doc: next, past, future: [] })
    emit({ doc: next, patches, origin: 'local' })
    return true
  }

  function undo() {
    const { past, future, doc } = store.getState()
    const entry = past.at(-1)
    if (!entry) return
    const next = applyPatches(doc, entry.inverse)
    store.setState({ doc: next, past: past.slice(0, -1), future: [...future, entry] })
    dropStaleSelection()
    emit({ doc: next, patches: entry.inverse, origin: 'undo' })
  }

  function redo() {
    const { past, future, doc } = store.getState()
    const entry = future.at(-1)
    if (!entry) return
    const next = applyPatches(doc, entry.patches)
    store.setState({ doc: next, past: [...past, entry], future: future.slice(0, -1) })
    dropStaleSelection()
    emit({ doc: next, patches: entry.patches, origin: 'redo' })
  }

  function dropStaleSelection() {
    const { selectedId, doc } = store.getState()
    if (selectedId && !doc.nodes[selectedId]) store.setState({ selectedId: null })
  }

  const select = (selectedId: NodeId | null) => store.setState({ selectedId })
  const setDrop = (drop: DropTarget | null) => {
    const current = store.getState().drop
    if (current?.parentId === drop?.parentId && current?.index === drop?.index) return
    store.setState({ drop })
  }

  /** Where a new block goes when the caller doesn't say: after the selection, else at the end. */
  function defaultInsertTarget(): { parentId: NodeId; index?: number } {
    const { doc, selectedId } = store.getState()
    const selected = findNode(doc, selectedId)
    if (selected?.parentId && selected.placement.mode === 'flow') {
      const siblings = getNode(doc, selected.parentId).children!.filter(
        (id) => doc.nodes[id]?.placement.mode === 'flow',
      )
      return { parentId: selected.parentId, index: siblings.indexOf(selected.id) + 1 }
    }
    return { parentId: doc.rootId }
  }

  const commands = {
    insertBlock<T extends BlockType>(
      type: T,
      target: { parentId?: NodeId; index?: number; placement?: Placement } = {},
      init?: (props: BlockProps<T>) => void,
    ): NodeId | null {
      const fallback = defaultInsertTarget()
      const parentId = target.parentId ?? fallback.parentId
      const index = target.parentId ? target.index : (target.index ?? fallback.index)
      const node = registry.createNode(type, { doc: store.getState().doc }, target)
      init?.(node.props as BlockProps<T>)
      const ok = transact((draft) => ops.insertNode(draft, registry, node, parentId, index))
      if (!ok) return null
      select(node.id)
      return node.id
    },
    moveNode: (id: NodeId, parentId: NodeId, index?: number) =>
      transact((draft) => ops.moveNode(draft, registry, id, parentId, index)),
    removeNode(id: NodeId) {
      if (transact((draft) => ops.removeNode(draft, id))) dropStaleSelection()
    },
    duplicateNode(id: NodeId) {
      let copyId: NodeId | null = null
      transact((draft) => {
        copyId = ops.duplicateNode(draft, registry, id)
      })
      if (copyId) select(copyId)
      return copyId
    },
    setPlacement: (id: NodeId, placement: Placement, options?: UpdateOptions) =>
      transact((draft) => ops.setPlacement(draft, registry, id, placement), options),
    updateProps<T extends BlockType>(
      id: NodeId,
      recipe: (props: Draft<BlockProps<T>>) => void,
      options?: UpdateOptions,
    ) {
      return transact((draft) => recipe(getNode(draft, id).props as Draft<BlockProps<T>>), options)
    },
    rename: (id: NodeId, name: string) =>
      transact((draft) => {
        getNode(draft, id).name = name || undefined
      }),
    updateTheme: (recipe: (theme: Theme) => void, options?: UpdateOptions) =>
      transact((draft) => recipe(draft.theme), options),
    updateMeta: (recipe: (meta: DocumentMeta) => void, options?: UpdateOptions) =>
      transact((draft) => recipe(draft.meta), options),
    addAssets(assets: Omit<Asset, 'id'>[]): AssetId[] {
      const withIds = assets.map((asset) => ({ ...asset, id: createAssetId() }))
      transact((draft) => {
        for (const asset of withIds) draft.assets[asset.id] = asset
      })
      return withIds.map((asset) => asset.id)
    },
  }

  return {
    store,
    registry,
    readOnly,
    galleryUrl,
    commands,
    transact,
    undo,
    redo,
    select,
    setDrop,
    setMode: (mode: EditorMode) => store.setState({ mode, selectedId: null }),
    getState: store.getState,
    /** Replace the whole document (e.g. after loading from storage). Clears history. */
    load(next: CanvasDocument) {
      store.setState({ doc: next, selectedId: null, past: [], future: [] })
      emit({ doc: next, patches: [], origin: 'load' })
    },
    subscribe(listener: ChangeListener) {
      listeners.add(listener)
      return () => void listeners.delete(listener)
    },
  }
}

export type Editor = ReturnType<typeof createEditor>
