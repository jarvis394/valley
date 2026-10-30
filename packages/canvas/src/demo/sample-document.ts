import type { Asset, CanvasDocument, CanvasNode } from '../core/document'
import { assetId, nodeId } from '../core/ids'
import { FLOW } from '../core/placement'
import { defaultTheme } from '../core/theme'

/** Deterministic ids so the server- and client-rendered demo match. Files live in the app's /demo. */
const photo = (id: string, name: string, width: number, height: number, mb: number): Asset => ({
  id: assetId(`a_${id}`),
  kind: 'image',
  name,
  src: `/demo/${id}.jpg`,
  width,
  height,
  size: Math.round(mb * 1024 * 1024),
})

const assets: Asset[] = [
  photo('stockholm-34', 'Stockholm-34.jpg', 1800, 1199, 8.4),
  photo('stockholm-91', 'Stockholm-91.jpg', 800, 1200, 6.9),
  photo('sennaya-9', 'Sennaya-9.jpg', 800, 1200, 7.2),
  photo('sennaya-13', 'Sennaya-13.jpg', 1200, 1200, 5.1),
  photo('sennaya-26', 'Sennaya-26.jpg', 800, 1200, 6.3),
  photo('snezhnyy-vecher-204', 'SnezhnyyVecher-204.jpg', 800, 1200, 7.8),
  photo('oulu-12', 'Oulu-12.jpg', 800, 1200, 9.1),
  photo('avatar', 'avatar.png', 800, 1200, 4.6),
  photo('lesnaya-251', 'Lesnaya-251.jpg', 801, 1200, 3.2),
  {
    id: assetId('a_flower'),
    kind: 'video',
    name: 'flower.mp4',
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    width: 1280,
    height: 720,
    size: Math.round(5.4 * 1024 * 1024),
  },
]

const images = assets.filter((a) => a.kind === 'image').map((a) => a.id)
const root = nodeId('n_root')

const node = <T extends CanvasNode>(n: Omit<T, 'parentId' | 'v'>) =>
  ({ ...n, parentId: root, v: 1 }) as T

const children: CanvasNode[] = [
  node<CanvasNode<'cover'>>({
    id: nodeId('n_cover'),
    type: 'cover',
    placement: FLOW,
    props: {
      title: 'Stockholm 2026',
      subtitle: '',
      assetId: assetId('a_stockholm-34'),
      focalPoint: { x: 0.5, y: 0.6 },
      variant: 'split',
      align: 'center',
      showMeta: true,
    },
  }),
  node<CanvasNode<'text'>>({
    id: nodeId('n_text'),
    type: 'text',
    placement: FLOW,
    props: {
      value:
        'The Industrial Revolution and its consequences have been a disaster for the human race. They have greatly increased the life-expectancy of those of us who live in “advanced” countries, but they have destabilized society, have made life unfulfilling, have subjected human beings to indignities, have led to widespread psychological suffering and have inflicted severe damage on the natural world.',
      align: 'center',
      padding: 'small',
      width: 'wide',
    },
  }),
  node<CanvasNode<'collection'>>({
    id: nodeId('n_collection'),
    type: 'collection',
    placement: FLOW,
    props: {
      title: 'Collection',
      showTitle: false,
      assetIds: [...images.slice(1, 2), images[0]!, ...images.slice(2)],
      overrides: { gallery: { layout: 'files' } },
    },
  }),
  node<CanvasNode<'scene'>>({
    id: nodeId('n_scene'),
    type: 'scene',
    placement: FLOW,
    props: {
      assetId: assetId('a_flower'),
      focalPoint: { x: 0.5, y: 0.5 },
      height: 'natural',
      fit: 'cover',
      caption: 'Kungsträdgården, early May',
    },
  }),
  node<CanvasNode<'collection'>>({
    id: nodeId('n_strip'),
    type: 'collection',
    name: 'A very long name for a collection',
    placement: FLOW,
    props: {
      title: 'A very long name for a collection',
      showTitle: false,
      assetIds: images,
      overrides: { gallery: { layout: 'grid', spacing: 'small', roundness: 0 } },
    },
  }),
]

export const sampleDocument: CanvasDocument = {
  schemaVersion: 1,
  rootId: root,
  meta: {
    title: 'Stockholm 2026',
    author: 'Vladislav Ekushev',
    authorAvatar: '/demo/author.jpg',
    date: '2026-05-02',
    slug: 'august-qu0s6j',
    location: '',
    storeUntil: 'month',
    visibility: 'private',
    usePassword: true,
    password: 'valley-2026',
    createdAt: '2026-07-29',
    updatedAt: '2026-07-30',
  },
  theme: defaultTheme,
  assets: Object.fromEntries(assets.map((a) => [a.id, a])) as CanvasDocument['assets'],
  nodes: Object.fromEntries([
    [
      root,
      {
        id: root,
        type: 'page',
        parentId: null,
        children: children.map((c) => c.id),
        placement: FLOW,
        v: 1,
        props: {},
      },
    ],
    ...children.map((c) => [c.id, c]),
  ]),
}
