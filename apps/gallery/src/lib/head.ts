import type { CanvasDocument } from '@valley/canvas'
import { registry } from './registry'

export function galleryHead(doc: CanvasDocument) {
  const title = doc.meta.author ? `${doc.meta.title} · ${doc.meta.author}` : doc.meta.title
  const image = registry.thumbnailOf(doc)

  return {
    meta: [
      { title },
      { property: 'og:title', content: title },
      { property: 'og:type', content: 'website' },
      ...(image ? [{ property: 'og:image', content: image }] : []),
    ],
  }
}
