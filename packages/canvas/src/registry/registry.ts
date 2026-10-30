import type { BlockType, CanvasNode } from '../core/document'
import { createNodeId } from '../core/ids'
import type { ContainmentRules } from '../core/operations'
import type { Placement, PlacementMode } from '../core/placement'
import type { AnyBlockDefinition, BlockDefinition, CreateBlockContext } from './types'

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
    return {
      id: createNodeId(),
      type,
      parentId: null,
      children: definition.container ? [] : undefined,
      placement: overrides.placement ?? definition.placement.initial(),
      v: definition.version,
      props: definition.create(context),
    } as CanvasNode<T>
  }
}
