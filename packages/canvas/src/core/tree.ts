import type { BlockType, CanvasDocument, CanvasNode } from './document'
import type { NodeId } from './ids'
import { CanvasOperationError } from './errors'

/** Read-only queries over the node tree. Safe to call on immer drafts too. */

export function getNode(doc: CanvasDocument, id: NodeId): CanvasNode {
  const node = doc.nodes[id]
  if (!node) throw new CanvasOperationError(`Node ${id} does not exist`)
  return node
}

export const findNode = (doc: CanvasDocument, id: NodeId | null | undefined) =>
  id ? doc.nodes[id] : undefined

export function isNodeOfType<T extends BlockType>(
  node: CanvasNode | undefined,
  type: T,
): node is CanvasNode<T> {
  return node?.type === type
}

export const getChildren = (doc: CanvasDocument, id: NodeId): CanvasNode[] =>
  (doc.nodes[id]?.children ?? []).map((childId) => getNode(doc, childId))

/** Ids of the flow children of `id`, in order. Indexes into this list are "flow indexes". */
export const flowChildIds = (doc: CanvasDocument, id: NodeId): NodeId[] =>
  (doc.nodes[id]?.children ?? []).filter((childId) => doc.nodes[childId]?.placement.mode === 'flow')

/** Position of `id` among its parent's flow children, or -1. */
export function flowIndexOf(doc: CanvasDocument, id: NodeId): number {
  const parentId = doc.nodes[id]?.parentId
  return parentId ? flowChildIds(doc, parentId).indexOf(id) : -1
}

export const absoluteChildIds = (doc: CanvasDocument, id: NodeId): NodeId[] =>
  (doc.nodes[id]?.children ?? []).filter(
    (childId) => doc.nodes[childId]?.placement.mode === 'absolute',
  )

export function getAncestors(doc: CanvasDocument, id: NodeId): NodeId[] {
  const result: NodeId[] = []
  let current = doc.nodes[id]?.parentId ?? null
  while (current) {
    result.push(current)
    current = doc.nodes[current]?.parentId ?? null
  }
  return result
}

export const isAncestor = (doc: CanvasDocument, ancestorId: NodeId, id: NodeId) =>
  getAncestors(doc, id).includes(ancestorId)

/** Depth-first, parent before children. */
export function* walk(doc: CanvasDocument, id: NodeId): Generator<CanvasNode> {
  const node = doc.nodes[id]
  if (!node) return
  yield node
  for (const childId of node.children ?? []) yield* walk(doc, childId)
}

export const collectSubtree = (doc: CanvasDocument, id: NodeId) => [...walk(doc, id)]
