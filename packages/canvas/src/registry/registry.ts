import type { BlockType, CanvasDocument, CanvasNode } from '../core/document'
import { createNodeId, type AssetId, type NodeId } from '../core/ids'
import type { ContainmentRules } from '../core/operations'
import type { Placement, PlacementMode } from '../core/placement'
import { walk } from '../core/tree'
import type {
  AnyBlockDefinition,
  BlockDefinition,
  CreateBlockContext,
  SlotContext,
  SlotSpec,
} from './types'

const TITLE_LENGTH = 64

/**
 * A set of blocks available to a given surface. Different surfaces (project editor,
 * portfolio editor, public viewer) can be handed different registries.
 */
export class BlockRegistry implements ContainmentRules {
  readonly #definitions = new Map<string, AnyBlockDefinition>()

  constructor(definitions: readonly AnyBlockDefinition[]) {
    for (const definition of definitions) {
      if (this.#definitions.has(definition.type)) {
        throw new Error(`Block "${definition.type}" is registered twice`)
      }
      this.#definitions.set(definition.type, definition)
    }
  }

  has(type: string): type is BlockType {
    return this.#definitions.has(type)
  }

  get<T extends BlockType>(type: T): BlockDefinition<T> {
    const definition = this.#definitions.get(type)
    if (!definition) throw new Error(`Unknown block type "${type}"`)

    return definition as unknown as BlockDefinition<T>
  }

  titleOf(node: CanvasNode): string {
    if (node.name) return node.name
    const definition = this.get(node.type) as BlockDefinition<BlockType>
    const title = definition.title?.(node.props).trim()
    if (!title) return definition.label

    return title.length > TITLE_LENGTH ? `${title.slice(0, TITLE_LENGTH).trimEnd()}…` : title
  }

  list(): AnyBlockDefinition[] {
    return [...this.#definitions.values()]
  }

  insertable(): AnyBlockDefinition[] {
    return this.list().filter((definition) => definition.insertable !== false)
  }

  canContain(parent: CanvasNode, childType: BlockType, mode: PlacementMode): boolean {
    const container = this.#definitions.get(parent.type)?.container
    const child = this.#definitions.get(childType)
    if (!container || !child || !child.placement.allowed.includes(mode)) return false
    if (container.layout === 'slots') {
      return mode === 'flow' && container.slots.some((slot) => slot.type === childType)
    }
    if (mode === 'absolute') return !!container.allowsAbsolute

    return container.accepts?.(childType) ?? true
  }

  /** Slots `parent`'s block declares; empty for blocks that aren't slot containers. */
  slotsOf(parent: CanvasNode): readonly SlotSpec[] {
    const container = this.#definitions.get(parent.type)?.container

    return container?.layout === 'slots' ? container.slots : []
  }

  /** The child that fills `slot`, built from `context`. `id` pins it for migrations. */
  createSlotNode(parent: CanvasNode, slot: SlotSpec, context: SlotContext, id?: NodeId) {
    const definition = this.get(slot.type) as BlockDefinition<BlockType>
    const node = this.#node(definition, slot.create(context as never))

    return {
      ...node,
      id: id ?? node.id,
      parentId: parent.id,
      name: slot.label,
      slot: slot.name,
      hidden: slot.hidden?.(context) || undefined,
    } as CanvasNode
  }

  /**
   * A new block and, for slot containers, its slot children: the subtree to insert,
   * root first.
   */
  createNodes<T extends BlockType>(
    type: T,
    context: CreateBlockContext,
    overrides: { placement?: Placement } = {},
  ): [CanvasNode<T>, ...CanvasNode[]] {
    const definition = this.get(type)
    const props = definition.create(context)

    return this.#withSlots(this.#node(definition, props, overrides), context) as [
      CanvasNode<T>,
      ...CanvasNode[],
    ]
  }

  /** The block that takes file drops, holding `assetIds`; null if none does. */
  createNodesFromAssets(assetIds: AssetId[], context: CreateBlockContext): CanvasNode[] | null {
    const definition = this.list().find((item) => item.fromAssets)
    if (!definition?.fromAssets) return null

    return this.#withSlots(
      this.#node(definition, definition.fromAssets(assetIds, context)),
      context,
    )
  }

  /** The project cover asset: the first cover-providing block in document order. */
  coverAssetId(doc: CanvasDocument): AssetId | null {
    for (const node of walk(doc, doc.rootId)) {
      const definition = this.#definitions.get(node.type) as BlockDefinition<BlockType> | undefined
      const assetId = definition?.coverAsset?.(node.props)
      if (assetId) return assetId
    }

    return null
  }

  /** Every photo the lightbox pages through: visible blocks in document order, each once. */
  lightboxAssets(doc: CanvasDocument): AssetId[] {
    const ids = new Set<AssetId>()

    const visit = (id: NodeId) => {
      const node = doc.nodes[id]
      if (!node || node.hidden) return
      const definition = this.#definitions.get(node.type) as BlockDefinition<BlockType> | undefined
      for (const assetId of definition?.lightboxAssets?.(node.props) ?? []) ids.add(assetId)
      for (const childId of node.children ?? []) visit(childId)
    }

    visit(doc.rootId)

    return [...ids]
  }

  /** Points the first cover-holding block at `assetId`. False when the document has none. */
  setCoverAsset(doc: CanvasDocument, assetId: AssetId): boolean {
    for (const node of walk(doc, doc.rootId)) {
      const definition = this.#definitions.get(node.type) as BlockDefinition<BlockType> | undefined
      if (!definition?.setCoverAsset) continue
      definition.setCoverAsset(node.props, assetId)

      return true
    }

    return false
  }

  /** The first block that can hold a cover, showing `assetId`; null if none can. */
  createCoverNodes(assetId: AssetId, context: CreateBlockContext): CanvasNode[] | null {
    const definition = this.list().find((item) => item.setCoverAsset) as
      | BlockDefinition<BlockType>
      | undefined
    if (!definition?.setCoverAsset) return null
    const props = definition.create(context)
    definition.setCoverAsset(props, assetId)

    return this.#withSlots(this.#node(definition, props), context)
  }

  /** Thumbnail source: the cover image, else the first image, else a video poster. */
  thumbnailOf(doc: CanvasDocument): string | undefined {
    const coverAssetId = this.coverAssetId(doc)
    const asset =
      (coverAssetId && doc.assets[coverAssetId]) ||
      Object.values(doc.assets).find((a) => a.kind === 'image')

    return asset?.kind === 'image' ? asset.src : asset?.poster
  }

  #withSlots(root: CanvasNode, context: CreateBlockContext): [CanvasNode, ...CanvasNode[]] {
    const children = this.slotsOf(root).map((slot) =>
      this.createSlotNode(root, slot, { ...context, from: root.props }),
    )
    if (children.length > 0) root.children = children.map((child) => child.id)

    return [root, ...children]
  }

  #node(
    definition: Pick<AnyBlockDefinition, 'type' | 'container' | 'placement' | 'version'>,
    props: unknown,
    overrides: { placement?: Placement } = {},
  ): CanvasNode {
    return {
      id: createNodeId(),
      type: definition.type,
      parentId: null,
      children: definition.container ? [] : undefined,
      placement: overrides.placement ?? definition.placement.initial(),
      v: definition.version,
      props,
    } as CanvasNode
  }
}
