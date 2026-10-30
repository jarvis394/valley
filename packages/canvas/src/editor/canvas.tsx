import { useMemo } from 'react'
import { googleFontsHref } from '../core/fonts'
import { useEditorState } from './context'
import { BlockDragProvider } from './dnd'
import { NodeRenderer } from './node-renderer'

/** Loads Google Fonts used by the theme or by any block-level typography override. */
function FontLoader() {
  const theme = useEditorState((state) => state.doc.theme)
  const nodes = useEditorState((state) => state.doc.nodes)
  const href = useMemo(() => {
    const ids = new Set([theme.typography.headingFont, theme.typography.bodyFont])
    for (const node of Object.values(nodes)) {
      const typography = (node.props as { overrides?: { typography?: Record<string, unknown> } })
        .overrides?.typography
      for (const key of ['headingFont', 'bodyFont']) {
        if (typeof typography?.[key] === 'string') ids.add(typography[key])
      }
    }
    return googleFontsHref(ids)
  }, [theme, nodes])
  // React 19 hoists <link precedence> into <head> and dedupes it.
  return href ? <link rel="stylesheet" href={href} precedence="default" /> : null
}

export function Canvas() {
  const rootId = useEditorState((state) => state.doc.rootId)
  const editing = useEditorState((state) => state.mode === 'edit')

  const content = (
    <>
      <FontLoader />
      <NodeRenderer id={rootId} />
    </>
  )
  if (!editing) return content

  return <BlockDragProvider>{content}</BlockDragProvider>
}
