import { cn } from '@valley/ui'
import { CanvasViewer, type CanvasDocument, type LightboxProps } from '@valley/canvas'
import { registry } from '../lib/registry'
import { AppBar } from './app-bar'

/** A published project, rendered by the same blocks the editor previews with. */
export function GalleryView({
  doc,
  appBar = true,
  ...lightbox
}: LightboxProps & {
  doc: CanvasDocument
  /** Off where there is no portfolio to go back to (a single-gallery export). */
  appBar?: boolean
}) {
  const first = doc.nodes[doc.rootId]?.children
    ?.map((id) => doc.nodes[id])
    .find((node) => node && !node.hidden && node.placement.mode === 'flow')
  const opensOnCover = first?.type === 'cover'

  return (
    <>
      {appBar && <AppBar />}
      <main className={cn('min-h-dvh', appBar && !opensOnCover && 'pt-14')}>
        <CanvasViewer doc={doc} registry={registry} {...lightbox} />
      </main>
    </>
  )
}
