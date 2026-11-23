import {
  assetId,
  defaultTheme,
  FLOW,
  nodeId,
  type Asset,
  type CanvasDocument,
  type DocumentMeta,
  type ProjectSettings,
} from '@valley/canvas'
import type { Account } from '../../src/data/types'
import { sampleDocument, sampleSettings } from './sample-document'
import { tripDocument } from './trips'

export interface ProjectRecord {
  id: string
  doc: CanvasDocument
  settings: ProjectSettings
  views: number
  newFavorites: number
}

export const account: Account = {
  id: 'u_vladislav',
  name: 'Vladislav Ekushev',
  email: 'vladislav@valley.local',
  avatar: '/demo/user.jpg',
  views: 12_400,
  role: 'admin',
  isAdmin: true,
  hasPassword: true,
  hasUploadedAvatar: true,
}

const ROOT = nodeId('n_root')
const COVER = nodeId('n_cover')

export const emptyDocument = (meta: Pick<DocumentMeta, 'title' | 'date'>): CanvasDocument => ({
  schemaVersion: 1,
  rootId: ROOT,
  meta: { ...sampleDocument.meta, ...meta, createdAt: meta.date, updatedAt: meta.date },
  theme: defaultTheme,
  assets: {},
  nodes: {
    [ROOT]: {
      id: ROOT,
      type: 'page',
      parentId: null,
      children: [],
      placement: FLOW,
      v: 1,
      props: {},
    },
  },
})

const coverPhoto = (file: string, width: number, height: number): Asset => ({
  id: assetId(`a_${file}`),
  kind: 'image',
  name: `${file}.jpg`,
  src: `/demo/${file}.jpg`,
  width,
  height,
  size: Math.round(0.5 * 1024 * 1024),
})

/** The sample document retitled, with `cover` on its cover block. */
function sampleWithCover(meta: Pick<DocumentMeta, 'title' | 'date'>, cover: Asset): CanvasDocument {
  const coverNode = sampleDocument.nodes[COVER]
  if (coverNode?.type !== 'cover') throw new Error('The sample document has no cover block')

  return {
    ...sampleDocument,
    meta: { ...sampleDocument.meta, ...meta },
    assets: { ...sampleDocument.assets, [cover.id]: cover },
    nodes: {
      ...sampleDocument.nodes,
      [COVER]: {
        ...coverNode,
        props: { ...coverNode.props, assetId: cover.id },
      },
    },
  }
}

const publicAt = (slug: string): ProjectSettings => ({
  slug,
  storeUntil: 'year',
  visibility: 'public',
})

export const projects: ProjectRecord[] = [
  {
    id: 'munich',
    doc: tripDocument('munich', { title: 'Munich', date: '2026-08-01' }, 'islands'),
    settings: publicAt('01-08-2026-munich'),
    views: 0,
    newFavorites: 0,
  },
  {
    id: 'stockholm',
    doc: tripDocument('stockholm', { title: 'Stockholm', date: '2026-05-02' }, 'justified'),
    settings: publicAt('02-05-2026-stockholm'),
    views: 0,
    newFavorites: 0,
  },
  {
    id: 'abc-band-shoot',
    doc: sampleWithCover(
      { title: 'ABC Band Shoot', date: '2026-08-27' },
      coverPhoto('abc-band-shoot', 1600, 1066),
    ),
    settings: publicAt('27-08-2026-abc-band-shoot'),
    views: 49_249,
    newFavorites: 2,
  },
  {
    id: 'stockholm-2026',
    doc: sampleDocument,
    settings: sampleSettings,
    views: 8_312,
    newFavorites: 0,
  },
  {
    id: 'oulu-winter',
    doc: sampleWithCover(
      { title: 'Oulu’s Winter', date: '2026-01-31' },
      coverPhoto('oulu-winter', 1600, 1066),
    ),
    settings: publicAt('31-01-2026-oulu-s-winter'),
    views: 1_298,
    newFavorites: 1,
  },
  {
    id: 'oulun-keskusta',
    doc: sampleWithCover(
      { title: 'Oulun Keskusta', date: '2025-09-23' },
      coverPhoto('oulun-keskusta', 1600, 1066),
    ),
    settings: publicAt('23-09-2025-oulun-keskusta'),
    views: 17_976,
    newFavorites: 0,
  },
  {
    id: 'saint-petersburg',
    doc: sampleWithCover(
      { title: 'Saint-Petersburg', date: '2025-09-14' },
      coverPhoto('project-saint-petersburg', 160, 160),
    ),
    settings: publicAt('14-09-2025-saint-petersburg'),
    views: 3_410,
    newFavorites: 0,
  },
  {
    id: 'testing-the-gallery',
    doc: emptyDocument({ title: 'Testing the gallery', date: '2025-09-05' }),
    settings: { slug: 'testing-the-gallery', visibility: 'private' },
    views: 0,
    newFavorites: 0,
  },
]
