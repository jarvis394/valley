import { BlockRegistry } from '../registry/registry'
import type { AnyBlockDefinition } from '../registry/types'
import { collectionBlock } from './collection'
import { coverBlock } from './cover'
import { islandBlock } from './island'
import { pageBlock } from './page'
import { sceneBlock } from './scene'
import { stickerBlock } from './sticker'
import { textBlock } from './text'

export { collectionBlock, coverBlock, islandBlock, pageBlock, sceneBlock, stickerBlock, textBlock }

export const defaultBlocks: AnyBlockDefinition[] = [
  pageBlock,
  coverBlock,
  textBlock,
  collectionBlock,
  islandBlock,
  sceneBlock,
  stickerBlock,
]

export const createDefaultRegistry = () => new BlockRegistry(defaultBlocks)
