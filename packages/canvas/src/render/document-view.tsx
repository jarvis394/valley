import { memo, type CSSProperties, type ReactNode } from 'react'
import { useStore } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { googleFontsHref } from '../core/fonts'
import type { NodeId } from '../core/ids'
import type { AbsolutePlacement } from '../core/placement'
import {
  useChildIds,
  useDocumentState,
  useNode,
  useRenderContext,
  useSlotIds,
  type DocumentState,
} from './context'

const selectFontIds = ({ doc }: DocumentState) => {
  const ids = new Set([doc.theme.typography.heading.font, doc.theme.typography.body.font])
  for (const node of Object.values(doc.nodes)) {
    if (node.type === 'text' && node.props.style.font) ids.add(node.props.style.font)
  }

  return [...ids].toSorted()
}

/** Loads Google Fonts used by the project styles or set on any text. */
export function FontLoader() {
  const fontIds = useStore(useRenderContext().store, useShallow(selectFontIds))
  const href = googleFontsHref(fontIds)

  // React 19 hoists <link precedence> into <head> and dedupes it.
  return href ? <link rel="stylesheet" href={href} precedence="default" /> : null
}

/** Places an absolute node inside its parent's overlay, in fractions of the parent box. */
export const absolutePlacementStyle = ({
  x,
  y,
  width,
  rotation,
  z,
}: AbsolutePlacement): CSSProperties => ({
  left: `${x * 100}%`,
  top: `${y * 100}%`,
  width: `${width * 100}%`,
  zIndex: 20 + z,
  rotate: `${rotation}deg`,
})

const noUpdate = () => {}

export const mapSlots = (slotIds: Record<string, NodeId>, render: (id: NodeId) => ReactNode) =>
  Object.fromEntries(Object.entries(slotIds).map(([slot, id]) => [slot, render(id)]))

/** Read-only rendering of the whole document (published page, editor preview). */
export function DocumentView() {
  const rootId = useDocumentState((state) => state.doc.rootId)

  return (
    <>
      <FontLoader />
      <ViewNode id={rootId} />
    </>
  )
}

const ViewNode = memo(function ViewNode({ id }: { id: NodeId }) {
  const { registry } = useRenderContext()
  const node = useNode(id)
  const slotIds = useSlotIds(id)
  if (!node || node.hidden) return null
  const definition = registry.get(node.type)
  const { Render } = definition
  const layout = definition.container?.layout
  const slots = mapSlots(slotIds, renderViewNode)

  return (
    <Render
      node={node as never}
      props={node.props as never}
      update={noUpdate}
      mode="view"
      selected={false}
      slots={layout === 'slots' ? slots : undefined}
    >
      {layout === 'stack' ? <ViewChildren parentId={id} /> : undefined}
    </Render>
  )
})

const renderViewNode = (id: NodeId) => <ViewNode id={id} />

function ViewChildren({ parentId }: { parentId: NodeId }) {
  const { flow, absolute } = useChildIds(parentId)

  return (
    <div className="relative">
      {flow.map((id) => (
        <div key={id}>
          <ViewNode id={id} />
        </div>
      ))}
      {absolute.length > 0 && (
        <div className="pointer-events-none absolute inset-0">
          {absolute.map((id) => (
            <ViewAbsoluteItem key={id} id={id} />
          ))}
        </div>
      )}
    </div>
  )
}

function ViewAbsoluteItem({ id }: { id: NodeId }) {
  const node = useNode(id)
  if (!node || node.placement.mode !== 'absolute') return null

  return (
    <div className="pointer-events-auto absolute" style={absolutePlacementStyle(node.placement)}>
      <ViewNode id={id} />
    </div>
  )
}
