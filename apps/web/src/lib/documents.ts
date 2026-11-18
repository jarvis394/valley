import { defaultTheme, FLOW, nodeId, type CanvasDocument, type DocumentMeta } from '@valley/canvas'

const ROOT = nodeId('n_root')

/** A document with an empty page, for a project that has no content yet. */
export const emptyDocument = (
  meta: Pick<DocumentMeta, 'title' | 'date' | 'author'> & Partial<DocumentMeta>,
): CanvasDocument => ({
  schemaVersion: 1,
  rootId: ROOT,
  meta: { location: '', createdAt: meta.date, updatedAt: meta.date, ...meta },
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
