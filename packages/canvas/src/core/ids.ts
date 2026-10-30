import { nanoid } from 'nanoid'
import { z } from 'zod'

/**
 * Branded ids. zod's brand derives the TS type from the runtime schema, so a parsed
 * document already has branded ids.
 */
export const nodeIdSchema = z.string().min(1).brand<'NodeId'>()
export const assetIdSchema = z.string().min(1).brand<'AssetId'>()

export type NodeId = z.infer<typeof nodeIdSchema>
export type AssetId = z.infer<typeof assetIdSchema>

export const createNodeId = () => `n_${nanoid(10)}` as NodeId
export const createAssetId = () => `a_${nanoid(10)}` as AssetId

/** For fixtures and tests where ids must be deterministic (e.g. SSR-rendered demo docs). */
export const nodeId = (id: string) => id as NodeId
export const assetId = (id: string) => id as AssetId
