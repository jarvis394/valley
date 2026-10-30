import type { BlockType, CanvasDocument, CanvasNode } from './document'
import { createNodeId, type NodeId } from './ids'
import type { Placement, PlacementMode } from './placement'
import { collectSubtree, getNode, isAncestor } from './tree'

/**
 * Structural mutations. They operate on a mutable document (an immer draft in practice),
 * keep `parentId`/`children` consistent, and enforce containment rules supplied by the
 * block registry. Prop edits skip this module; they are plain draft mutations.
 */
export interface ContainmentRules {
  canContain(parent: CanvasNode, childType: BlockType, mode: PlacementMode): boolean
}

export class CanvasOperationError extends Error {}

function assertCanContain(rules: ContainmentRules, parent: CanvasNode, child: CanvasNode) {
  if (!parent.children) {
    throw new CanvasOperationError(`${parent.type} is not a container`)
  }
  if (!rules.canContain(parent, child.type, child.placement.mode)) {
    throw new CanvasOperationError(
      `${parent.type} does not accept ${child.placement.mode} ${child.type}`,
    )
  }
}

/**
 * `index` is the position among *flow* siblings (what a sortable list reports).
 * Absolute children have no meaningful order in `children` (they stack by `placement.z`),
 * so they're appended.
 */
function attach(doc: CanvasDocument, parent: CanvasNode, node: CanvasNode, index?: number) {
  const children = parent.children!
  node.parentId = parent.id
  if (node.placement.mode !== 'flow' || index === undefined) {
    children.push(node.id)
    return
  }
  const flowPositions = children.flatMap((id, position) =>
    doc.nodes[id]?.placement.mode === 'flow' ? [position] : [],
  )
  const position =
    index < flowPositions.length ? flowPositions[index]! : (flowPositions.at(-1) ?? -1) + 1
  children.splice(position, 0, node.id)
}

function detach(doc: CanvasDocument, node: CanvasNode) {
  if (!node.parentId) return
  const parent = getNode(doc, node.parentId)
  parent.children = parent.children?.filter((id) => id !== node.id)
  node.parentId = null
}

/** Inserts `nodes` (a detached subtree whose first item is its root) under `parentId`. */
export function insertSubtree(
  doc: CanvasDocument,
  rules: ContainmentRules,
  nodes: CanvasNode[],
  parentId: NodeId,
  index?: number,
) {
  const [root] = nodes
  if (!root) return
  const parent = getNode(doc, parentId)
  assertCanContain(rules, parent, root)
  for (const node of nodes) doc.nodes[node.id] = node
  attach(doc, parent, root, index)
}

export const insertNode = (
  doc: CanvasDocument,
  rules: ContainmentRules,
  node: CanvasNode,
  parentId: NodeId,
  index?: number,
) => insertSubtree(doc, rules, [node], parentId, index)

export function moveNode(
  doc: CanvasDocument,
  rules: ContainmentRules,
  id: NodeId,
  parentId: NodeId,
  index?: number,
) {
  const node = getNode(doc, id)
  const parent = getNode(doc, parentId)
  if (id === parentId || isAncestor(doc, id, parentId)) {
    throw new CanvasOperationError('Cannot move a node into itself')
  }
  assertCanContain(rules, parent, node)
  detach(doc, node)
  attach(doc, parent, node, index)
}

export function removeNode(doc: CanvasDocument, id: NodeId) {
  if (id === doc.rootId) throw new CanvasOperationError('Cannot remove the root node')
  const node = getNode(doc, id)
  const subtree = collectSubtree(doc, id)
  detach(doc, node)
  for (const item of subtree) delete doc.nodes[item.id]
}

/** Deep-copies a subtree with fresh ids and inserts it right after the original. */
export function duplicateNode(doc: CanvasDocument, rules: ContainmentRules, id: NodeId): NodeId {
  const node = getNode(doc, id)
  if (!node.parentId) throw new CanvasOperationError('Cannot duplicate the root node')
  // JSON round-trip rather than structuredClone: `doc` may be an immer draft (a Proxy).
  const subtree: CanvasNode[] = JSON.parse(JSON.stringify(collectSubtree(doc, id)))
  const idMap = new Map<NodeId, NodeId>(subtree.map((item) => [item.id, createNodeId()]))
  for (const item of subtree) {
    item.id = idMap.get(item.id)!
    item.parentId = item.parentId && (idMap.get(item.parentId) ?? item.parentId)
    item.children = item.children?.map((childId) => idMap.get(childId)!)
  }
  const copy = subtree[0]!
  if (copy.placement.mode === 'absolute') {
    copy.placement = { ...copy.placement, x: copy.placement.x + 0.03, y: copy.placement.y + 0.03 }
  }
  const parent = getNode(doc, node.parentId)
  const flowIndex = parent
    .children!.filter((childId) => doc.nodes[childId]?.placement.mode === 'flow')
    .indexOf(id)
  insertSubtree(doc, rules, subtree, parent.id, flowIndex + 1)
  return copy.id
}

export function setPlacement(
  doc: CanvasDocument,
  rules: ContainmentRules,
  id: NodeId,
  placement: Placement,
) {
  const node = getNode(doc, id)
  const parent = node.parentId ? getNode(doc, node.parentId) : null
  if (parent && !rules.canContain(parent, node.type, placement.mode)) {
    throw new CanvasOperationError(`${parent.type} does not accept ${placement.mode} children`)
  }
  node.placement = placement
}
