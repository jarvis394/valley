import { z } from 'zod'
import { assetIdSchema, nodeIdSchema, type AssetId, type NodeId } from './ids'
import { placementSchema, type Placement } from './placement'
import { themeOverridesSchema, themeSchema, type Theme, type ThemeOverrides } from './theme'

/**
 * Block props keyed by block type. Each block adds its entry with module augmentation,
 * `declare module '../../core/document' { interface BlockPropsMap { cover: CoverProps } }`,
 * so `CanvasNode` becomes a union over registered blocks without core importing block code.
 */
// oxlint-disable-next-line typescript/no-empty-interface, typescript/no-empty-object-type
export interface BlockPropsMap {}

export type BlockType = keyof BlockPropsMap & string
export type BlockProps<T extends BlockType> = BlockPropsMap[T]

export interface NodeBase {
  id: NodeId
  parentId: NodeId | null
  /** Ordered child ids. Present only on container nodes. Flow children render in this order. */
  children?: NodeId[]
  placement: Placement
  /** Version of the `props` schema the node was written with. Migrations read it. */
  v: number
  hidden?: boolean
  locked?: boolean
  /** Theme groups this node deviates on. Only groups in its definition's `themeGroups` apply. */
  overrides?: ThemeOverrides
}

/** Distributes over `T`, so `CanvasNode` is a union narrowable by `node.type`. */
export type CanvasNode<T extends BlockType = BlockType> = T extends BlockType
  ? NodeBase & { type: T; props: BlockPropsMap[T] }
  : never

export const assetSchema = z.object({
  id: assetIdSchema,
  kind: z.enum(['image', 'video']),
  name: z.string(),
  src: z.string(),
  poster: z.string().optional(),
  width: z.number().positive(),
  height: z.number().positive(),
  size: z.number().nonnegative().optional(),
})

export type Asset = z.infer<typeof assetSchema>

export const documentMetaSchema = z.object({
  title: z.string(),
  author: z.string(),
  /** ISO date the project was shot. */
  date: z.string(),
  authorAvatar: z.string().optional(),
  location: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type DocumentMeta = z.infer<typeof documentMetaSchema>

export const DOCUMENT_SCHEMA_VERSION = 1

export interface CanvasDocument {
  schemaVersion: typeof DOCUMENT_SCHEMA_VERSION
  rootId: NodeId
  nodes: Record<NodeId, CanvasNode>
  assets: Record<AssetId, Asset>
  theme: Theme
  meta: DocumentMeta
}

/** Shape-only schema: node props are validated per block type by the registry. */
export const rawNodeSchema = z.object({
  id: nodeIdSchema,
  type: z.string(),
  parentId: nodeIdSchema.nullable(),
  children: z.array(nodeIdSchema).optional(),
  placement: placementSchema,
  v: z.number().int().nonnegative(),
  props: z.unknown(),
  name: z.string().optional(),
  hidden: z.boolean().optional(),
  locked: z.boolean().optional(),
  overrides: themeOverridesSchema.optional(),
})

export const rawDocumentSchema = z.object({
  schemaVersion: z.literal(DOCUMENT_SCHEMA_VERSION),
  rootId: nodeIdSchema,
  nodes: z.record(z.string(), rawNodeSchema),
  assets: z.record(z.string(), assetSchema),
  theme: themeSchema,
  meta: documentMetaSchema,
})
