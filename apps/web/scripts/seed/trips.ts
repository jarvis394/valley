import {
  assetId,
  defaultTheme,
  FLOW,
  nodeId,
  type Asset,
  type CanvasDocument,
  type CanvasNode,
  type DocumentMeta,
} from '@valley/canvas'
import { sampleDocument } from './sample-document'
import { tripPhotos } from './trip-photos'

type Trip = keyof typeof tripPhotos

const root = nodeId('n_root')

const node = <T extends CanvasNode>(n: Omit<T, 'parentId' | 'v' | 'placement'>) =>
  ({ ...n, parentId: root, placement: FLOW, v: 1 }) as T

/**
 * A trip's photos after a cover: one Island block per group as the photographer split
 * them, or every photo in one justified collection.
 */
export function tripDocument(
  trip: Trip,
  meta: Pick<DocumentMeta, 'title' | 'date'>,
  layout: 'islands' | 'justified',
): CanvasDocument {
  let count = 0
  const islands = tripPhotos[trip].map((group) =>
    group.map(([width, height, size]): Asset => {
      const name = `${trip}-${String(++count).padStart(2, '0')}`

      return {
        id: assetId(`a_${name}`),
        kind: 'image',
        name: `${name}.jpg`,
        src: `/demo/${trip}/${name}.jpg`,
        width,
        height,
        size,
      }
    }),
  )
  const assets = islands.flat()
  const cover = node<CanvasNode<'cover'>>({
    id: nodeId('n_cover'),
    type: 'cover',
    // Its Title and Subtitle slots are filled from the project title when the seed is saved.
    children: [],
    props: {
      assetId: assets.find((a) => a.width > a.height)?.id ?? assets[0]!.id,
      focalPoint: { x: 0.5, y: 0.5 },
      variant: 'split',
      align: 'center',
      showMeta: true,
    },
  })
  const photos =
    layout === 'islands'
      ? islands.map((group, i) =>
          node<CanvasNode<'island'>>({
            id: nodeId(`n_island_${i + 1}`),
            type: 'island',
            props: { assetIds: group.map((a) => a.id) },
          }),
        )
      : [
          node<CanvasNode<'collection'>>({
            id: nodeId('n_collection'),
            type: 'collection',
            props: { title: meta.title, showTitle: false, assetIds: assets.map((a) => a.id) },
          }),
        ]
  const children = [cover, ...photos]

  return {
    schemaVersion: 1,
    rootId: root,
    meta: { ...sampleDocument.meta, ...meta, createdAt: meta.date, updatedAt: meta.date },
    theme: {
      ...defaultTheme,
      gallery:
        layout === 'islands'
          ? { layout: 'justified', size: 240, spacing: 4, roundness: 0 }
          : defaultTheme.gallery,
    },
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
}
