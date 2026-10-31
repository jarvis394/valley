import { useDraggable } from '@dnd-kit/react'
import { ArrowDown, ArrowUp, Copy, Trash2 } from 'lucide-react'
import { memo } from 'react'
import type { NodeId } from '../core/ids'
import { flowIndexOf, flowChildIds } from '../core/tree'
import { useChildIds, useNode } from '../render/context'
import { absolutePlacementStyle } from '../render/document-view'
import { useEditor, useEditorState, useUpdateProps } from './context'
import {
  DRAG_TYPE,
  DropLine,
  dropContainerProps,
  dropItemProps,
  useDropEdge,
  type DragData,
} from './dnd'
import { cn, IconButton } from '@valley/ui'

/**
 * Renders any node in edit mode by looking up its block definition. Containers get their
 * children slot. Read-only rendering lives in `render/document-view`.
 */
export const NodeRenderer = memo(function NodeRenderer({ id }: { id: NodeId }) {
  const editor = useEditor()
  const node = useNode(id)
  const selected = useEditorState((state) => state.selectedId === id)
  const update = useUpdateProps(id)
  if (!node || node.hidden) return null

  const definition = editor.registry.get(node.type)
  const { Render } = definition
  return (
    <Render
      node={node as never}
      props={node.props as never}
      update={update}
      mode="edit"
      selected={selected}
    >
      {definition.container ? <NodeChildren parentId={id} /> : undefined}
    </Render>
  )
})

/**
 * Lays out a container's children. Flow children go in a stack, and absolute children go
 * in an overlay whose box is the coordinate space for their fractional placement.
 * Container layouts other than `stack` would branch here on `definition.container.layout`.
 */
function NodeChildren({ parentId }: { parentId: NodeId }) {
  const { flow: flowIds, absolute: absoluteIds } = useChildIds(parentId)
  return (
    <div
      className="relative flex flex-col"
      data-canvas-container={parentId}
      {...dropContainerProps(parentId)}
    >
      {flowIds.map((id, index) => (
        <FlowItem key={id} id={id} index={index} count={flowIds.length} parentId={parentId} />
      ))}
      {flowIds.length === 0 && (
        <div className="p-12 text-center text-[13px] text-fg/32">Empty. Add a block</div>
      )}
      {absoluteIds.length > 0 && (
        <div className="pointer-events-none absolute inset-0">
          {absoluteIds.map((id) => (
            <AbsoluteItem key={id} id={id} parentId={parentId} />
          ))}
        </div>
      )}
    </div>
  )
}

function FlowItem({
  id,
  index,
  count,
  parentId,
}: {
  id: NodeId
  index: number
  count: number
  parentId: NodeId
}) {
  const editor = useEditor()
  const node = useNode(id)
  const selected = useEditorState((state) => state.selectedId === id)
  const dropEdge = useDropEdge(parentId, index, count)
  const { ref, handleRef, isDragSource } = useDraggable<DragData>({
    id,
    type: DRAG_TYPE.flow,
    data: { kind: 'flow-node', nodeId: id },
  })
  if (!node) return null
  const label = editor.registry.titleOf(node)

  return (
    <div
      ref={ref}
      data-node-id={id}
      {...dropItemProps}
      onPointerDown={(event) => {
        event.stopPropagation()
        if (!selected) editor.select(id)
      }}
      className={cn(
        'group/block relative flex flex-col transition-opacity',
        selected && 'z-10',
        isDragSource && 'opacity-40',
      )}
    >
      <div className="flex h-10 justify-between gap-2 pr-2 select-none">
        <button
          ref={handleRef}
          type="button"
          aria-label={`Drag ${label}`}
          className={cn(
            'max-w-full cursor-grab touch-none truncate bg-canvas px-4 pt-4 pb-1.5 text-left text-[13px] leading-[18px] font-medium text-fg/32 outline-none hover:text-fg/63 active:cursor-grabbing',
            selected && 'text-focus-fg hover:text-focus-fg',
          )}
        >
          {label}
        </button>
        {selected && <BlockToolbar id={id} />}
      </div>
      <div
        className={cn(
          'border-y border-dashed border-white/7',
          selected && 'border-solid border-focus bg-focus-wash/4',
        )}
      >
        <NodeRenderer id={id} />
      </div>
      <DropLine edge={dropEdge} />
    </div>
  )
}

function BlockToolbar({ id }: { id: NodeId }) {
  const editor = useEditor()
  /** `gap` is the flow index to drop into, counted with this node still in place. */
  const moveToGap = (offset: number) => {
    const { doc } = editor.getState()
    const parentId = doc.nodes[id]?.parentId
    if (!parentId) return
    const gap = flowIndexOf(doc, id) + offset
    if (gap >= 0 && gap <= flowChildIds(doc, parentId).length) {
      editor.commands.moveNode(id, parentId, gap)
    }
  }
  return (
    <div className="flex items-center gap-0.5 pt-4 pb-1.5">
      <IconButton size="xs" variant="dimmed" aria-label="Move up" onClick={() => moveToGap(-1)}>
        <ArrowUp className="size-3" />
      </IconButton>
      <IconButton size="xs" variant="dimmed" aria-label="Move down" onClick={() => moveToGap(2)}>
        <ArrowDown className="size-3" />
      </IconButton>
      <IconButton
        size="xs"
        variant="dimmed"
        aria-label="Duplicate"
        onClick={() => editor.commands.duplicateNode(id)}
      >
        <Copy className="size-3" />
      </IconButton>
      <IconButton
        size="xs"
        variant="dimmed"
        aria-label="Delete"
        onClick={() => editor.commands.removeNode(id)}
      >
        <Trash2 className="size-3" />
      </IconButton>
    </div>
  )
}

function AbsoluteItem({ id, parentId }: { id: NodeId; parentId: NodeId }) {
  const editor = useEditor()
  const node = useNode(id)
  const selected = useEditorState((state) => state.selectedId === id)
  const { ref, isDragging } = useDraggable<DragData>({
    id,
    type: DRAG_TYPE.absolute,
    disabled: node?.locked,
    data: { kind: 'absolute-node', nodeId: id, parentId },
  })
  if (!node || node.placement.mode !== 'absolute') return null

  return (
    <div
      ref={ref}
      data-node-id={id}
      onPointerDown={(event) => {
        event.stopPropagation()
        editor.select(id)
      }}
      className={cn(
        'pointer-events-auto absolute cursor-move touch-none',
        selected && 'outline-2 outline-offset-4 outline-focus',
        isDragging && 'opacity-80',
      )}
      style={absolutePlacementStyle(node.placement)}
    >
      <NodeRenderer id={id} />
    </div>
  )
}
