import type { Draft } from 'immer'
import type { ComponentType, ReactNode } from 'react'
import type { z } from 'zod'
import type { BlockProps, BlockType, CanvasDocument, CanvasNode } from '../core/document'
import type { AssetId } from '../core/ids'
import type { Placement, PlacementMode } from '../core/placement'
import type { ThemeGroup } from '../core/theme'

export type RenderMode = 'edit' | 'view'

export interface UpdateOptions {
  /** Consecutive updates sharing a key within a short window collapse into one undo step. */
  mergeKey?: string
}

export type UpdateProps<P> = (recipe: (draft: Draft<P>) => void, options?: UpdateOptions) => void

/**
 * What a block's renderer receives. Blocks never touch the store directly: they get their
 * props plus a scoped `update`, which keeps them portable between the editor and a
 * read-only viewer (where `update` is a no-op and `mode` is `view`).
 */
export interface BlockRenderProps<T extends BlockType> {
  node: CanvasNode<T>
  props: BlockProps<T>
  update: UpdateProps<BlockProps<T>>
  mode: RenderMode
  selected: boolean
  /** Rendered children, for container blocks. */
  children?: ReactNode
}

export interface BlockInspectorProps<T extends BlockType> {
  node: CanvasNode<T>
  props: BlockProps<T>
  update: UpdateProps<BlockProps<T>>
}

/**
 * Container capabilities. Only `stack` (the 1D page) exists. Another layout needs a
 * variant here and a branch in `NodeChildren`.
 */
export type ContainerLayout = 'stack'

export interface ContainerSpec {
  layout: ContainerLayout
  /** Which block types may be dropped in as flow children. Defaults to all. */
  accepts?: (type: BlockType) => boolean
  /** Whether absolutely positioned children (stickers, badges) are allowed. */
  allowsAbsolute?: boolean
}

export interface CreateBlockContext {
  doc: CanvasDocument
}

export interface BlockDefinition<T extends BlockType> {
  type: T
  label: string
  description?: string
  icon: ComponentType<{ className?: string }>
  /** Bump when `props` shape changes; provide `migrate` to upgrade stored nodes. */
  version: number
  schema: z.ZodType<BlockProps<T>>
  create: (ctx: CreateBlockContext) => BlockProps<T>
  migrate?: (props: unknown, fromVersion: number) => unknown
  placement: {
    allowed: readonly PlacementMode[]
    /** Placement for freshly inserted nodes. */
    initial: () => Placement
  }
  container?: ContainerSpec
  /** Theme groups the node may override; the inspector shows a section for each. */
  themeGroups?: readonly ThemeGroup[]
  /** Builds props from freshly uploaded files. The first block with it receives file drops. */
  fromAssets?: (assetIds: AssetId[], ctx: CreateBlockContext) => BlockProps<T>
  /** The asset this block shows as the project cover, which is also the project thumbnail. */
  coverAsset?: (props: BlockProps<T>) => AssetId | null
  /** Shown in the "add block" menu. Defaults to true. */
  insertable?: boolean
  experimental?: boolean
  Render: ComponentType<BlockRenderProps<T>>
  Inspector?: ComponentType<BlockInspectorProps<T>>
  /** Name shown in the outline and inspector, derived from content. Blank falls back to `label`. */
  title?: (props: BlockProps<T>) => string
  /** Secondary info for the outline (e.g. file count). */
  describe?: (
    node: CanvasNode<T>,
  ) => { meta?: string; metaIcon?: ComponentType<{ className?: string }> } | undefined
}

/** Union of all concrete definitions, which is what a registry holds. */
export type AnyBlockDefinition = { [K in BlockType]: BlockDefinition<K> }[BlockType]

export const defineBlock = <T extends BlockType>(definition: BlockDefinition<T>) => definition
