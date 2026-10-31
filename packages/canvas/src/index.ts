// Document model and utils (framework-free)
export * from './core/document'
export * from './core/ids'
export * from './core/placement'
export * from './core/theme'
export * from './core/fonts'
export * from './core/settings'
export * from './core/format'
export { summarizeAssets } from './core/assets'
export { CanvasOperationError } from './core/errors'
export * as tree from './core/tree'
export * as operations from './core/operations'

// Blocks and registry
export * from './registry/types'
export { BlockRegistry } from './registry/registry'
export { parseDocument } from './registry/parse'
export * from './blocks'

// Block surfaces: read-only and editable
export * from './render/context'
export { CanvasViewer } from './render/canvas-viewer'
export { Canvas } from './editor/canvas'

// Editor store, hooks and utils
export {
  createEditor,
  type ChangeListener,
  type CreateEditorOptions,
  type DropTarget,
  type Editor,
  type EditorMode,
  type EditorState,
} from './editor/editor'
export { readLocalAsset, type ReadAsset } from './editor/assets'
export * from './editor/context'
export { useEditorHotkeys } from './editor/hotkeys'
export { persistEditor } from './editor/persistence'
export { scrollToNode } from './editor/dom'
export {
  BlockDragProvider,
  DropLine,
  dropContainerProps,
  dropItemProps,
  useDropEdge,
  useFlowDraggable,
} from './editor/dnd'
