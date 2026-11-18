import { createFileRoute, notFound } from '@tanstack/react-router'
import { GalleryView } from '../components/gallery-view'
import { getGallery } from '../data/gallery'
import { galleryHead } from '../lib/head'

export const Route = createFileRoute('/$slug')({
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

  return <GalleryView doc={doc} />
}
