import { assetIdSchema } from '@valley/canvas'
import { createFileRoute, notFound } from '@tanstack/react-router'
import { z } from 'zod'
import { GalleryView } from '../components/gallery-view'
import { getGallery } from '../data/gallery'
import { galleryHead } from '../lib/head'

export const Route = createFileRoute('/$slug')({
  // The open photo, so a link can point at one.
  validateSearch: z.object({ photo: assetIdSchema.optional().catch(undefined) }),
  loader: async ({ params }) => {
    const gallery = await getGallery({ data: params.slug })
    if (!gallery) throw notFound()

    return gallery
  },
  head: ({ loaderData }) => (loaderData ? galleryHead(loaderData.doc) : {}),
  component: Gallery,
})

function Gallery() {
  const { doc } = Route.useLoaderData()
  const { photo } = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <GalleryView
      doc={doc}
      photo={photo}
      onPhotoChange={(next) =>
        // Paging through photos rewrites one history entry instead of stacking them.
        void navigate({ search: { photo: next ?? undefined }, replace: true, resetScroll: false })
      }
    />
  )
}
