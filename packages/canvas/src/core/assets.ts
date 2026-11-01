import type { Asset } from './document'

export function summarizeAssets(assets: Record<string, Asset> | Asset[]) {
  const files = Array.isArray(assets) ? assets : Object.values(assets)

  return {
    count: files.length,
    images: files.filter((asset) => asset.kind === 'image').length,
    videos: files.filter((asset) => asset.kind === 'video').length,
    bytes: files.reduce((sum, asset) => sum + (asset.size ?? 0), 0),
  }
}
