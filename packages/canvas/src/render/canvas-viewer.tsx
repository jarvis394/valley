import { useEffect, useState } from 'react'
import { createStore } from 'zustand/vanilla'
import type { CanvasDocument } from '../core/document'
import type { BlockRegistry } from '../registry/registry'
import { RenderProvider, type DocumentState } from './context'
import { DocumentView } from './document-view'

/** Read-only rendering of a document with the same block renderers (published page). */
export function CanvasViewer({ doc, registry }: { doc: CanvasDocument; registry: BlockRegistry }) {
  const [context] = useState(() => ({
    store: createStore<DocumentState>(() => ({ doc })),
    registry,
  }))
  // oxlint-disable-next-line valley/no-unreasoned-state-sync -- pushes the doc prop into the store blocks read from, which lives outside React
  useEffect(() => context.store.setState({ doc }), [context, doc])
  return (
    <RenderProvider value={context}>
      <DocumentView />
    </RenderProvider>
  )
}
