import {
  getDb,
  getPortfolio,
  getPublishedProject,
  getStorage,
  mediaRoute,
  recordView,
  type UrlFor,
} from '@valley/backend'

/** Set by scripts/export.ts while it prerenders a static copy. */
const exporting = () => process.env.GALLERY_EXPORT === '1'

const localMedia = mediaRoute('/media')

/** A static export ships media next to its pages; a live gallery may point at a public bucket. */
const urlFor: UrlFor = (key) => (!exporting() && getStorage().publicUrl(key)) || localMedia(key)

export async function loadGallery(slug: string) {
  const project = await getPublishedProject(getDb(), slug, urlFor)
  if (project && !exporting()) {
    recordView(getDb(), project.id).catch((error: unknown) =>
      console.error(`Could not count a view of ${slug}`, error),
    )
  }

  return project && { slug: project.slug, doc: project.doc }
}

/** The portfolio, or the one gallery a single-gallery export puts at the site root. */
export async function loadHome() {
  const slug = exporting() ? process.env.GALLERY_EXPORT_SLUG : undefined
  if (slug) {
    const gallery = await loadGallery(slug)

    return gallery && { kind: 'gallery' as const, gallery }
  }

  const portfolio = await getPortfolio(getDb(), urlFor)

  return portfolio && { kind: 'portfolio' as const, portfolio }
}
