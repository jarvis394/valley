import { createContext, use, type ReactNode } from 'react'
import { useStore } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import type { StoreApi } from 'zustand/vanilla'
import type { CanvasDocument, CanvasNode } from '../core/document'
import type { AssetId, NodeId } from '../core/ids'
import { absoluteChildIds, flowChildIds } from '../core/tree'
import type { BlockRegistry } from '../registry/registry'

export interface DocumentState {
  doc: CanvasDocument
}

export type DocumentStore = Pick<
  StoreApi<DocumentState>,
  'getState' | 'getInitialState' | 'subscribe'
>

/**
 * What blocks may read while rendering. The editor and the read-only viewer both provide
 * it, so blocks never depend on the editor.
 */
export interface RenderContextValue {
  store: DocumentStore
  registry: BlockRegistry
  /** Adds files to the project. Absent on read-only surfaces. */
  uploadAssets?: (files: File[]) => Promise<AssetId[]>
  /** Makes an asset the project cover. Absent on read-only surfaces. */
  setCover?: (assetId: AssetId) => void
}

const RenderContext = createContext<RenderContextValue | null>(null)

export function RenderProvider({
  value,
  children,
}: {
  value: RenderContextValue
  children: ReactNode
}) {
  return <RenderContext value={value}>{children}</RenderContext>
}

export function useRenderContext(): RenderContextValue {
  const context = use(RenderContext)
  if (!context) throw new Error('Canvas blocks must render inside <RenderProvider>')

  return context
}

/** Selectors must return stable references (immer structural sharing gives us that). */
export const useDocumentState = <T,>(selector: (state: DocumentState) => T): T =>
  useStore(useRenderContext().store, selector)

export const useDocument = () => useDocumentState((state) => state.doc)
export const useNode = (id: NodeId) => useDocumentState((state) => state.doc.nodes[id])
export const useTheme = () => useDocumentState((state) => state.doc.theme)
export const useMeta = () => useDocumentState((state) => state.doc.meta)
export const useAssets = () => useDocumentState((state) => state.doc.assets)

export const useAsset = (id: AssetId | null | undefined) =>
  useDocumentState((state) => (id ? state.doc.assets[id] : undefined))

export function useCoverAssetId() {
  const { registry } = useRenderContext()

  return useDocumentState((state) => registry.coverAssetId(state.doc))
}

export function useThumbnailSrc() {
  const { registry } = useRenderContext()

  return useDocumentState((state) => registry.thumbnailOf(state.doc))
}

/** Child ids of a container split by placement mode. Each list is shallow-compared. */
export function useChildIds(parentId: NodeId) {
  const { store } = useRenderContext()
  const flow = useStore(
    store,
    useShallow((state) => flowChildIds(state.doc, parentId)),
  )
  const absolute = useStore(
    store,
    useShallow((state) => absoluteChildIds(state.doc, parentId)),
  )

  return { flow, absolute }
}

/** Visible slot children of a slot container, by slot name. Shallow-compared. */
export function useSlotIds(parentId: NodeId): Record<string, NodeId> {
  const { store } = useRenderContext()

  return useStore(
    store,
    useShallow((state) => {
      const entries = (state.doc.nodes[parentId]?.children ?? []).flatMap((id) => {
        const child = state.doc.nodes[id]

        return child?.slot && !child.hidden ? [[child.slot, id] as const] : []
      })

      return Object.fromEntries(entries)
    }),
  )
}

/** The slot spec `node` fills, if it is a slot child. */
export function useSlotSpec(node: CanvasNode) {
  const { registry } = useRenderContext()
  const parent = useDocumentState((state) =>
    node.parentId ? state.doc.nodes[node.parentId] : undefined,
  )

  return node.slot && parent
    ? registry.slotsOf(parent).find((slot) => slot.name === node.slot)
    : undefined
}
