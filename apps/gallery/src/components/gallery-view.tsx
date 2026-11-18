import { CanvasViewer, type CanvasDocument } from '@valley/canvas'
import { registry } from '../lib/registry'

/** A published project, rendered by the same blocks the editor previews with. */
export function GalleryView({ doc }: { doc: CanvasDocument }) {
  return (
    <main className="min-h-dvh">
      <CanvasViewer doc={doc} registry={registry} />
    </main>
  )
}
