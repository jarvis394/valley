import { rawDocumentSchema, type CanvasDocument, type CanvasNode } from '../core/document'
import type { NodeId } from '../core/ids'
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

  for (const node of Object.values(raw.nodes)) {
    if (!registry.has(node.type)) {
      warnings.push(`Dropped node ${node.id}: unknown block type "${node.type}"`)
      continue
    }
    const definition = registry.get(node.type)
    let props = node.props
    if (node.v < definition.version) {
      if (!definition.migrate) {
        warnings.push(`Node ${node.id}: no migration from v${node.v} for "${node.type}"`)
      } else {
        props = definition.migrate(props, node.v)
      }
    }
    const parsed = definition.schema.safeParse(props)
    if (!parsed.success) {
      warnings.push(`Node ${node.id}: invalid props, reset to defaults (${parsed.error.message})`)
    }
    nodes[node.id] = {
      ...node,
      v: definition.version,
      props: parsed.success ? parsed.data : definition.create({ doc: raw as never }),
    } as CanvasNode
  }

  // Repair dangling references left by dropped nodes.
  for (const node of Object.values(nodes)) {
    node.children = node.children?.filter((childId) => childId in nodes)
  }
  if (!(raw.rootId in nodes)) throw new Error('Document root is missing or invalid')

  return {
    doc: { ...raw, nodes, assets: raw.assets as CanvasDocument['assets'] },
    warnings,
  }
}
