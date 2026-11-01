import type { BlockType, CanvasDocument, CanvasNode } from '../core/document'
import { createNodeId, type AssetId } from '../core/ids'
import type { ContainmentRules } from '../core/operations'
import type { Placement, PlacementMode } from '../core/placement'
import { walk } from '../core/tree'
import type { AnyBlockDefinition, BlockDefinition, CreateBlockContext } from './types'

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
    if (mode === 'absolute') return !!container.allowsAbsolute

    return container.accepts?.(childType) ?? true
  }

  createNode<T extends BlockType>(
    type: T,
    context: CreateBlockContext,
    overrides: { placement?: Placement } = {},
  ): CanvasNode<T> {
    const definition = this.get(type)

    return this.#node(definition, definition.create(context), overrides) as CanvasNode<T>
  }

  /** A node for the block that takes file drops, holding `assetIds`; null if none does. */
  createNodeFromAssets(assetIds: AssetId[], context: CreateBlockContext): CanvasNode | null {
    const definition = this.list().find((item) => item.fromAssets)
    if (!definition?.fromAssets) return null

    return this.#node(definition, definition.fromAssets(assetIds, context))
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

  /** Thumbnail source: the cover image, else the first image, else a video poster. */
  thumbnailOf(doc: CanvasDocument): string | undefined {
    const coverAssetId = this.coverAssetId(doc)
    const asset =
      (coverAssetId && doc.assets[coverAssetId]) ||
      Object.values(doc.assets).find((a) => a.kind === 'image')

    return asset?.kind === 'image' ? asset.src : asset?.poster
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
