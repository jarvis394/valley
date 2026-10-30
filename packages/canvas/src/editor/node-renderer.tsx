import { useDraggable } from '@dnd-kit/react'
import { ArrowDown, ArrowUp, Copy, Trash2 } from 'lucide-react'
import { memo, type ReactNode } from 'react'
import type { NodeId } from '../core/ids'
import type { RenderMode } from '../registry/types'
import { useChildIds, useEditor, useEditorState, useNode, useUpdateProps } from './context'
import {
  DRAG_TYPE,
  DropLine,
  dropContainerProps,
  dropItemProps,
  useDropEdge,
  type DragData,
} from './dnd'
import { cn } from '@valley/ui'

const useRenderMode = (): RenderMode =>
  useEditorState((state) => (state.mode === 'edit' ? 'edit' : 'view'))

/** Renders any node by looking up its block definition. Containers get their children slot. */
export const NodeRenderer = memo(function NodeRenderer({ id }: { id: NodeId }) {
  const editor = useEditor()
  const node = useNode(id)
  const mode = useRenderMode()
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
      mode={mode}
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
  const mode = useRenderMode()
  const { flow: flowIds, absolute: absoluteIds } = useChildIds(parentId)
  return (
    <div
      className={cn('relative', mode === 'edit' && 'flex flex-col gap-4')}
      data-canvas-container={parentId}
      {...dropContainerProps(parentId)}
    >
      {flowIds.map((id, index) =>
        mode === 'edit' ? (
          <FlowItem key={id} id={id} index={index} count={flowIds.length} parentId={parentId} />
        ) : (
          <div key={id} data-node-id={id} {...dropItemProps}>
            <NodeRenderer id={id} />
          </div>
        ),
      )}
      {mode === 'edit' && flowIds.length === 0 && (
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
  const label = node.name ?? editor.registry.get(node.type).label

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
        'group/block relative flex flex-col gap-1.5 transition-opacity',
        selected && 'z-10',
        isDragSource && 'opacity-40',
      )}
    >
      <div className="flex h-[18px] items-center justify-between gap-2 pr-2 select-none">
        <button
          ref={handleRef}
          type="button"
          aria-label={`Drag ${label}`}
          className={cn(
            'max-w-full cursor-grab touch-none truncate bg-canvas px-4 text-[13px] leading-[18px] font-medium text-fg/32 outline-none hover:text-fg/63 active:cursor-grabbing',
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
          selected && 'border-solid border-focus bg-focus/2',
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
  const move = (delta: number) => {
    const { doc } = editor.getState()
    const node = doc.nodes[id]
    if (!node?.parentId) return
    const siblings = (doc.nodes[node.parentId]?.children ?? []).filter(
      (childId) => doc.nodes[childId]?.placement.mode === 'flow',
    )
    const index = siblings.indexOf(id) + delta
    if (index >= 0 && index < siblings.length) editor.commands.moveNode(id, node.parentId, index)
  }
  return (
    <div className="flex items-center gap-0.5">
      <ToolbarButton label="Move up" onClick={() => move(-1)}>
        <ArrowUp className="size-3" />
      </ToolbarButton>
      <ToolbarButton label="Move down" onClick={() => move(1)}>
        <ArrowDown className="size-3" />
      </ToolbarButton>
      <ToolbarButton label="Duplicate" onClick={() => editor.commands.duplicateNode(id)}>
        <Copy className="size-3" />
      </ToolbarButton>
      <ToolbarButton label="Delete" onClick={() => editor.commands.removeNode(id)}>
        <Trash2 className="size-3" />
      </ToolbarButton>
    </div>
  )
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-[18px] items-center justify-center rounded text-focus-fg/63 hover:bg-white/7 hover:text-focus-fg"
    >
      {children}
    </button>
  )
}

function AbsoluteItem({ id, parentId }: { id: NodeId; parentId: NodeId }) {
  const editor = useEditor()
  const node = useNode(id)
  const mode = useRenderMode()
  const selected = useEditorState((state) => state.selectedId === id)
  const { ref, isDragging } = useDraggable<DragData>({
    id,
    type: DRAG_TYPE.absolute,
    disabled: mode !== 'edit' || node?.locked,
    data: { kind: 'absolute-node', nodeId: id, parentId },
  })
  if (!node || node.placement.mode !== 'absolute') return null
  const { x, y, width, rotation, z } = node.placement

  return (
    <div
      ref={ref}
      data-node-id={id}
      onPointerDown={(event) => {
        if (mode !== 'edit') return
        event.stopPropagation()
        editor.select(id)
      }}
      className={cn(
        'pointer-events-auto absolute',
        mode === 'edit' && 'cursor-move touch-none',
        selected && 'outline-2 outline-offset-4 outline-focus',
        isDragging && 'opacity-80',
      )}
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        width: `${width * 100}%`,
        zIndex: 20 + z,
        rotate: `${rotation}deg`,
      }}
    >
      <NodeRenderer id={id} />
    </div>
  )
}
