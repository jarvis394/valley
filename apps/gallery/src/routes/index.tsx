import { createFileRoute, notFound } from '@tanstack/react-router'
import { GalleryView } from '../components/gallery-view'
import { Portfolio } from '../components/portfolio'
import { getHome } from '../data/gallery'
import { galleryHead } from '../lib/head'

export const Route = createFileRoute('/')({
  loader: async () => {
    const home = await getHome()
    if (!home) throw notFound()

    return home
  },
  head: ({ loaderData }) =>
    loaderData?.kind === 'gallery'
      ? galleryHead(loaderData.gallery.doc)
      : { meta: [{ title: loaderData?.portfolio.owner.name ?? 'Galleries' }] },
  component: Home,
})

function Home() {
  const home = Route.useLoaderData()

  return home.kind === 'gallery' ? (
    <GalleryView doc={home.gallery.doc} />
  ) : (
    <Portfolio {...home.portfolio} />
  )
}
