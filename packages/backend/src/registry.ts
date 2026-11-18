import { createDefaultRegistry, type BlockRegistry } from '@valley/canvas'

let registry: BlockRegistry | undefined

export const getRegistry = () => (registry ??= createDefaultRegistry())
