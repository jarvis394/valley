import { rawDocumentSchema, type CanvasDocument, type CanvasNode } from '../core/document'
import { nodeId, type NodeId } from '../core/ids'
import type { BlockRegistry } from './registry'

export interface ParseResult {
  doc: CanvasDocument
  warnings: string[]
}

/**
 * Validates untrusted (persisted or remote) data into a `CanvasDocument`. It checks the
 * shape, runs per-node migrations, checks each block's props schema, then repairs the tree.
 * It drops nodes of unknown types with a warning instead of failing the whole document.
 */
export function parseDocument(input: unknown, registry: BlockRegistry): ParseResult {
  const raw = rawDocumentSchema.parse(input)
  const warnings: string[] = []
  const nodes: Record<NodeId, CanvasNode> = {}
  /** Props as stored (after migrations, before the schema strips old fields). */
  const storedProps = new Map<NodeId, unknown>()

  for (const node of Object.values(raw.nodes)) {
    if (!registry.has(node.type)) {
      warnings.push(`Dropped node ${node.id}: unknown block type "${node.type}"`)
      continue
    }
    const definition = registry.get(node.type)
    let props = node.props
    if (node.v > definition.version) {
      warnings.push(`Node ${node.id}: "${node.type}" v${node.v} is newer than this editor`)
    } else if (node.v < definition.version) {
      if (!definition.migrate) {
        warnings.push(`Node ${node.id}: no migration from v${node.v} for "${node.type}"`)
      } else {
        try {
          props = definition.migrate(props, node.v)
        } catch (error) {
          warnings.push(`Node ${node.id}: migration from v${node.v} failed (${String(error)})`)
        }
      }
    }
    storedProps.set(node.id, props)
    const parsed = definition.schema.safeParse(props)
    if (!parsed.success) {
      warnings.push(`Node ${node.id}: invalid props, reset to defaults (${parsed.error.message})`)
    }
    nodes[node.id] = {
      ...node,
      v: definition.version,
      children: definition.container ? (node.children ?? []) : undefined,
      props: parsed.success ? parsed.data : definition.create({ doc: raw as never }),
    } as CanvasNode
  }

  for (const node of Object.values(nodes)) fillSlots(node)

  // Gives a slot container one child per declared slot, creating any that are missing
  // (a block that just became a slot container). Ids derive from the parent so every read
  // of an unsaved document agrees.
  function fillSlots(parent: CanvasNode) {
    const slots = registry.slotsOf(parent)
    if (slots.length === 0) return
    parent.children = slots.map((slot) => {
      const existing = parent.children?.find((id) => {
        const child = nodes[id]

        return child?.slot === slot.name && child.type === slot.type
      })
      if (existing) return existing
      const context = { doc: raw as never, from: storedProps.get(parent.id) }
      const child = registry.createSlotNode(
        parent,
        slot,
        context,
        nodeId(`${parent.id}_${slot.name}`),
      )
      nodes[child.id] = child

      return child.id
    })
  }

  const root = nodes[raw.rootId]
  if (!root) throw new Error('Document root is missing or invalid')
  root.parentId = null

  // Rebuild parent links from the root down, so every kept node is reachable exactly once
  // and sits in a parent that accepts it.
  const reachable = new Set<NodeId>([root.id])
  const queue = [root]
  for (let parent = queue.shift(); parent; parent = queue.shift()) {
    parent.children = parent.children?.filter((childId) => {
      const child = nodes[childId]
      if (!child || reachable.has(childId)) return false
      if (!registry.canContain(parent, child.type, child.placement.mode)) {
        warnings.push(`Dropped node ${childId}: ${parent.type} does not accept it`)

        return false
      }
      reachable.add(childId)
      child.parentId = parent.id
      if (registry.slotsOf(parent).length === 0) delete child.slot
      queue.push(child)

      return true
    })
  }
  for (const id of Object.keys(nodes) as NodeId[]) {
    if (reachable.has(id)) continue
    warnings.push(`Dropped node ${id}: not reachable from the root`)
    delete nodes[id]
  }

  return {
    doc: { ...raw, nodes, assets: raw.assets as CanvasDocument['assets'] },
    warnings,
  }
}
