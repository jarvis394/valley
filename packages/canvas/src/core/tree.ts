import type { BlockType, CanvasDocument, CanvasNode } from './document'
import type { NodeId } from './ids'
import type { AbsolutePlacement } from './placement'

/** Read-only queries over the node tree. Safe to call on immer drafts too. */

export function getNode(doc: CanvasDocument, id: NodeId): CanvasNode {
  const node = doc.nodes[id]
  if (!node) throw new Error(`Node ${id} does not exist`)
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

export const getFlowChildren = (doc: CanvasDocument, id: NodeId) =>
  getChildren(doc, id).filter((child) => child.placement.mode === 'flow')

export const getAbsoluteChildren = (doc: CanvasDocument, id: NodeId) =>
  getChildren(doc, id).filter(
    (child): child is CanvasNode & { placement: AbsolutePlacement } =>
      child.placement.mode === 'absolute',
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
