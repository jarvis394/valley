import type { Asset } from '../../core/document'
import { clamp } from '../../core/placement'

export type IslandLayout = 'collage' | 'carousel' | 'grid'
export type IslandFrame = 'card' | 'minimal'

export type AlbumNode =
  | { kind: 'photo'; asset: Asset; ratio: number }
  | { kind: 'row'; children: AlbumNode[]; ratio: number }
  | { kind: 'col'; children: AlbumNode[]; ratio: number }

const MIN_ASPECT = 0.45
const MAX_ASPECT = 2.5
const CARD_PADDING = 16
const TARGET_ALBUM_RATIO = 1.05
const MAX_COMPLEX_ITEMS = 10

/** Clamps only extreme panoramas or tall screenshots; standard camera ratios stay exact. */
export const assetRatio = (asset: Asset) =>
  clamp(asset.width / asset.height, MIN_ASPECT, MAX_ASPECT)

const photoNode = (asset: Asset): AlbumNode => ({
  kind: 'photo',
  asset,
  ratio: assetRatio(asset),
})

const rowNode = (children: AlbumNode[]): AlbumNode => ({
  kind: 'row',
  children,
  ratio: children.reduce((sum, child) => sum + child.ratio, 0),
})

const colNode = (children: AlbumNode[]): AlbumNode => ({
  kind: 'col',
  children,
  ratio: 1 / children.reduce((sum, child) => sum + 1 / child.ratio, 0),
})

/**
 * Computes the island's outer max width from `size` and the planned album's natural ratio,
 * capping tall compositions by height instead of cropping photos to fit a wide column.
 */
export function islandMeasure(
  size: number,
  items: Asset[],
  layout: IslandLayout,
  framed: boolean,
  album: AlbumNode | null,
) {
  const maxWidth = Math.round(size * 3)
  const padding = framed ? CARD_PADDING : 0
  if (items.length === 0 || layout === 'carousel') return maxWidth + padding
  if (layout === 'grid') {
    const singleRatio = items.length === 1 ? assetRatio(items[0]!) : 1
    const maxHeight = Math.round(size * 2.6)
    const width =
      items.length === 1 ? Math.min(maxWidth, Math.round(maxHeight * singleRatio)) : maxWidth

    return width + padding
  }

  const ratio = album?.ratio ?? 1
  const maxHeight = Math.round(size * (items.length === 1 ? 2.55 : 3.1))
  const innerWidth = Math.min(maxWidth, Math.round(maxHeight * ratio))

  return innerWidth + padding
}

/**
 * Telegram-style album layout: chooses an order-preserving nested row/column tree so every
 * photo keeps its natural aspect ratio while the whole group forms a compact, flush post.
 */
export function planAlbum(items: Asset[]): AlbumNode | null {
  const count = items.length
  if (count === 0) return null

  const nodes = items.map(photoNode)
  if (count === 1) return nodes[0]!
  if (count === 2) return planTwo(nodes as [AlbumNode, AlbumNode])
  if (count === 3) return planThree(nodes as [AlbumNode, AlbumNode, AlbumNode])
  if (count === 4) return planFour(nodes as [AlbumNode, AlbumNode, AlbumNode, AlbumNode])

  return count <= MAX_COMPLEX_ITEMS ? planComplex(nodes) : planLarge(nodes)
}

function planTwo([a, b]: [AlbumNode, AlbumNode]): AlbumNode {
  const average = (a.ratio + b.ratio) / 2
  // Two similar wide photos stack vertically (Telegram's layoutTwoTopBottom) so neither shrinks.
  if (a.ratio > 1.2 && b.ratio > 1.2 && average > 1.4 && Math.abs(a.ratio - b.ratio) < 0.25) {
    return colNode([a, b])
  }

  return rowNode([a, b])
}

function planThree([a, b, c]: [AlbumNode, AlbumNode, AlbumNode]): AlbumNode {
  // Wide lead photo spans the top above a pair; otherwise a tall lead sits beside two stacked frames.
  if (a.ratio > 1.15) {
    return colNode([a, rowNode([b, c])])
  }

  return rowNode([a, colNode([b, c])])
}

function planFour([a, b, c, d]: [AlbumNode, AlbumNode, AlbumNode, AlbumNode]): AlbumNode {
  if (a.ratio > 1.15 && b.ratio + c.ratio + d.ratio <= 3.6) {
    return colNode([a, rowNode([b, c, d])])
  }
  if (a.ratio < 0.9 && b.ratio >= 1.1 && c.ratio >= 1.1 && d.ratio >= 1.1) {
    return rowNode([a, colNode([b, c, d])])
  }

  return colNode([rowNode([a, b]), rowNode([c, d])])
}

/** Enumerates valid 2-to-4-row partitions for 5..10 photos and picks the most balanced album. */
function planComplex(nodes: AlbumNode[]): AlbumNode {
  const count = nodes.length
  let bestTree: AlbumNode | null = null
  let bestScore = Number.POSITIVE_INFINITY

  const evaluate = (sizes: number[]) => {
    const rows: AlbumNode[] = []
    let cursor = 0
    for (const size of sizes) {
      const slice = nodes.slice(cursor, cursor + size)
      cursor += size
      rows.push(slice.length === 1 ? slice[0]! : rowNode(slice))
    }

    const album = colNode(rows)
    let score = Math.pow(Math.log(album.ratio / TARGET_ALBUM_RATIO), 2) * 14

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]!
      const length = sizes[i]!
      // Keep portraits from standing alone on their own row.
      if (length === 1 && row.ratio < 1.15) score += 100
      if (row.ratio > 3.6) score += Math.pow(row.ratio - 3.6, 2) * 6
      if (row.ratio < 1.15) score += Math.pow(1.15 - row.ratio, 2) * 6
      // Prefer 2..3 photos per row so frames remain legible on phones.
      if (length === 4) score += 1.2
    }

    // Slight pyramid bias: fewer, larger hero frames on top (e.g. 2+3 over 3+2).
    if (sizes[0]! < sizes[sizes.length - 1]!) score -= 0.35

    if (score < bestScore) {
      bestScore = score
      bestTree = album
    }
  }

  const search = (remaining: number, chosen: number[]) => {
    if (remaining === 0) {
      if (chosen.length >= 2) evaluate(chosen)

      return
    }
    if (chosen.length >= 4) return
    const maxSize = Math.min(4, remaining)
    for (let size = 1; size <= maxSize; size++) {
      chosen.push(size)
      search(remaining - size, chosen)
      chosen.pop()
    }
  }

  search(count, [])

  return bestTree ?? planLarge(nodes)
}

function planLarge(nodes: AlbumNode[]): AlbumNode {
  const count = nodes.length
  const dp = Array.from({ length: count + 1 }, () => Number.POSITIVE_INFINITY)
  const prev = Array.from({ length: count + 1 }, () => 0)
  dp[0] = 0

  for (let end = 1; end <= count; end++) {
    for (let start = Math.max(0, end - 4); start < end; start++) {
      const length = end - start
      let sum = 0
      for (let i = start; i < end; i++) sum += nodes[i]!.ratio
      const deviation = Math.log(sum / 2.3)
      let cost = dp[start]! + deviation * deviation * 10
      if (length === 1 && sum < 1.15) cost += 100
      if (length === 4) cost += 0.8
      if (cost < dp[end]!) {
        dp[end] = cost
        prev[end] = start
      }
    }
  }

  const rows: AlbumNode[] = []
  for (let cursor = count; cursor > 0; cursor = prev[cursor]!) {
    const slice = nodes.slice(prev[cursor]!, cursor)
    rows.push(slice.length === 1 ? slice[0]! : rowNode(slice))
  }
  rows.reverse()

  return rows.length === 1 ? rows[0]! : colNode(rows)
}

/** Normalizes track weights so their sum is always 100fr (CSS Grid shrinks rows when sum < 1fr). */
export function normalizedTracks(weights: number[]) {
  const total = weights.reduce((sum, w) => sum + w, 0) || 1

  return weights.map((w) => `${((w / total) * 100).toFixed(4)}fr`).join(' ')
}

export function gridColumnsClass(count: number) {
  if (count <= 1) return 'grid-cols-1'
  if (count === 2 || count === 4) return 'grid-cols-2'
  if (count === 3) return 'grid-cols-3'

  return 'grid-cols-2 sm:grid-cols-3'
}

export function gridTileAspect(items: Asset[]) {
  if (items.length === 0) return 'aspect-square'
  let landscapes = 0
  let portraits = 0
  for (const item of items) {
    const ratio = item.width / item.height
    if (ratio > 1.05) landscapes++
    else if (ratio < 0.95) portraits++
  }
  if (landscapes / items.length >= 0.65) return 'aspect-[4/3]'
  if (portraits / items.length >= 0.65) return 'aspect-[4/5]'

  return 'aspect-square'
}
