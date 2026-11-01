import { DragDropProvider, DragOverlay, useDraggable, type DragEndEvent } from '@dnd-kit/react'
import { GripVertical } from 'lucide-react'
import { useRef, type ReactNode } from 'react'
import type { NodeId } from '../core/ids'
import { clamp } from '../core/placement'
import { flowIndexOf, isAncestor } from '../core/tree'
import { useEditor, useEditorState } from './context'
import type { DropTarget, Editor } from './editor'

/**
 * Every draggable on the canvas carries one of these. A new drag interaction, such as
 * dropping files from the OS, needs a new variant and a branch in `handleDragEnd`.
 */
export type DragData =
  | { kind: 'flow-node'; nodeId: NodeId }
  | { kind: 'absolute-node'; nodeId: NodeId; parentId: NodeId }

export const DRAG_TYPE = { flow: 'flow-node', absolute: 'absolute-node' } as const

/**
 * DOM contract for flow drops: a list element marked `data-drop-container={parentId}` whose
 * direct children marked `data-drop-item` are its flow children, in order. Any surface
 * (canvas, outline) opts in with these two attributes.
 */
export const dropContainerProps = (parentId: NodeId) => ({ 'data-drop-container': parentId })
export const dropItemProps = { 'data-drop-item': '' }

export const containerSelector = (id: NodeId) => `[data-canvas-container="${id}"]`

/**
 * Moving screen-tall blocks mid-drag stutters, so flow blocks aren't sortables. We track the
 * pointer and store the nearest gap between blocks as `drop`, where blocks draw an indicator
 * line. The move happens once, on drop.
 */
function computeDrop(
  editor: Editor,
  nodeId: NodeId,
  x: number,
  y: number,
  fallback: Element | null,
) {
  const hit = document.elementFromPoint(x, y)?.closest('[data-drop-container]') ?? fallback
  if (!hit) return { target: null, container: null }
  const parentId = hit.getAttribute('data-drop-container') as NodeId
  const items = [...hit.querySelectorAll(':scope > [data-drop-item]')]
  let index = items.findIndex((item) => {
    const rect = item.getBoundingClientRect()

    return y < rect.top + rect.height / 2
  })
  if (index === -1) index = items.length

  const { doc } = editor.getState()
  const node = doc.nodes[nodeId]
  const parent = doc.nodes[parentId]
  if (!node || !parent) return { target: null, container: hit }
  // Dropping right before or after itself is a no-op: show nothing.
  if (node.parentId === parentId) {
    const current = flowIndexOf(doc, nodeId)
    if (index === current || index === current + 1) return { target: null, container: hit }
  }
  if (
    nodeId === parentId ||
    isAncestor(doc, nodeId, parentId) ||
    !editor.registry.canContain(parent, node.type, 'flow')
  ) {
    return { target: null, container: hit }
  }

  return { target: { parentId, index } satisfies DropTarget, container: hit }
}

function handleDragEnd(editor: Editor, event: DragEndEvent) {
  const { source } = event.operation
  const drop = editor.getState().drop
  editor.setDrop(null)
  if (event.canceled || !source) return
  const data = source.data as DragData

  switch (data.kind) {
    case 'flow-node': {
      if (drop) editor.commands.moveNode(data.nodeId, drop.parentId, drop.index)

      return
    }
    case 'absolute-node': {
      const node = editor.getState().doc.nodes[data.nodeId]
      const container = document.querySelector(containerSelector(data.parentId))
      if (!node || node.placement.mode !== 'absolute' || !container) return
      const rect = container.getBoundingClientRect()
      const { x, y } = event.operation.transform
      if (x === 0 && y === 0) return
      editor.commands.setPlacement(data.nodeId, {
        ...node.placement,
        x: clamp(node.placement.x + x / rect.width, -0.1, 1),
        y: clamp(node.placement.y + y / rect.height, -0.1, 1),
      })
    }
  }
}

/** Drag surface for blocks: chip preview, drop-line tracking, commit on drop. */
export function BlockDragProvider({ children }: { children: ReactNode }) {
  const editor = useEditor()
  const session = useRef<{
    nodeId: NodeId
    pointer: { x: number; y: number }
    container: Element | null
    onScroll: () => void
  } | null>(null)

  const update = () => {
    const current = session.current
    if (!current) return
    const { target, container } = computeDrop(
      editor,
      current.nodeId,
      current.pointer.x,
      current.pointer.y,
      current.container,
    )
    current.container = container
    editor.setDrop(target)
  }

  const end = () => {
    if (session.current) window.removeEventListener('scroll', session.current.onScroll, true)
    session.current = null
  }

  return (
    <DragDropProvider
      onDragStart={(event) => {
        const data = event.operation.source?.data as DragData | undefined
        if (data?.kind !== 'flow-node') return
        const onScroll = update
        // Auto-scroll moves blocks under a still pointer, so recompute on scroll too.
        window.addEventListener('scroll', onScroll, { capture: true, passive: true })
        session.current = {
          nodeId: data.nodeId,
          pointer: event.operation.position.current,
          container: null,
          onScroll,
        }
      }}
      onDragMove={(event) => {
        if (!session.current) return
        session.current.pointer = event.operation.position.current
        update()
      }}
      onDragEnd={(event) => {
        // A fast flick can end without any dragmove; resolve from the final pointer.
        if (session.current && !event.canceled) {
          session.current.pointer = event.operation.position.current
          update()
        }
        end()
        handleDragEnd(editor, event)
      }}
    >
      {children}
      {/* Blocks can be screen-tall; drag a compact chip instead of the block itself. */}
      <DragOverlay
        dropAnimation={null}
        disabled={(source) => (source?.data as DragData | undefined)?.kind !== 'flow-node'}
      >
        {(source) => <DragChip data={source.data as DragData} />}
      </DragOverlay>
    </DragDropProvider>
  )
}

function DragChip({ data }: { data: DragData }) {
  const editor = useEditor()
  const node = useEditorState((state) => state.doc.nodes[data.nodeId])
  if (!node || data.kind !== 'flow-node') return null
  const definition = editor.registry.get(node.type)
  const Icon = definition.icon

  return (
    <div className="pointer-events-none flex w-fit items-center gap-2 rounded-xl bg-accent px-3 py-2 text-sm text-white shadow-2xl">
      <GripVertical className="size-4" />
      <Icon className="size-4" />
      {editor.registry.titleOf(node)}
    </div>
  )
}

/** Makes an element drag the flow node `id`, for surfaces outside the canvas (outline). */
export function useFlowDraggable(id: NodeId) {
  const { ref, isDragSource } = useDraggable<DragData>({
    id,
    type: DRAG_TYPE.flow,
    data: { kind: 'flow-node', nodeId: id },
  })

  return { ref, isDragSource }
}

/**
 * Which edge of a flow item the drop line sits on, if any. Items draw the line themselves
 * (absolutely positioned), so it scrolls with content and costs no layout shift.
 */
export function useDropEdge(parentId: NodeId, index: number, count: number) {
  return useEditorState((state) => {
    const drop = state.drop
    if (drop?.parentId !== parentId) return null
    if (drop.index === index) return 'top'
    if (index === count - 1 && drop.index === count) return 'bottom'

    return null
  })
}

/** `gap` is the parent's row gap in px; the 2px line is centered in it. */
export function DropLine({
  edge,
  inset = 0,
  gap = 0,
}: {
  edge: 'top' | 'bottom' | null
  inset?: number
  gap?: number
}) {
  if (!edge) return null

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute z-30 h-0.5 rounded-full bg-focus shadow-[0_0_0_2px_rgb(0_0_0/0.4)]"
      style={{ left: inset, right: inset, [edge]: -(gap / 2 + 1) }}
    >
      <span className="absolute -top-[3px] -left-1 size-2 rounded-full bg-focus" />
    </div>
  )
}
