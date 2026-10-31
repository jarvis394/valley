import type { NodeId } from '../core/ids'

/** Scrolls the canvas to the rendered node, found by its `data-node-id`. */
export const scrollToNode = (id: NodeId) =>
  document
    .querySelector(`[data-node-id="${id}"]`)
    ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
