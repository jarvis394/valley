import { useDocumentState } from '../render/context'
import { DocumentView, FontLoader } from '../render/document-view'
import { useMode } from './context'
import { BlockDragProvider } from './dnd'
import { NodeRenderer } from './node-renderer'

export function Canvas() {
  const rootId = useDocumentState((state) => state.doc.rootId)
  if (useMode() !== 'edit') return <DocumentView />

  return (
    <BlockDragProvider>
      <FontLoader />
      <NodeRenderer id={rootId} />
    </BlockDragProvider>
  )
}
