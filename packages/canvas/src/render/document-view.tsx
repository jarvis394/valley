import { memo, type CSSProperties } from 'react'
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
  type DocumentState,
} from './context'

const selectFontIds = ({ doc }: DocumentState) => {
  const ids = new Set([doc.theme.typography.headingFont, doc.theme.typography.bodyFont])
  for (const node of Object.values(doc.nodes)) {
    const typography = node.overrides?.typography
    if (typography?.headingFont) ids.add(typography.headingFont)
    if (typography?.bodyFont) ids.add(typography.bodyFont)
  }

  return [...ids].toSorted()
}

/** Loads Google Fonts used by the theme or by any node's typography override. */
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
  if (!node || node.hidden) return null
  const definition = registry.get(node.type)
  const { Render } = definition

  return (
    <Render
      node={node as never}
      props={node.props as never}
      update={noUpdate}
      mode="view"
      selected={false}
    >
      {definition.container ? <ViewChildren parentId={id} /> : undefined}
    </Render>
  )
})

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
