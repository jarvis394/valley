// Core (framework-free model)
export * from './core/document'
export * from './core/ids'
export * from './core/placement'
export * from './core/theme'
export * from './core/fonts'
export * as tree from './core/tree'
export * as operations from './core/operations'

// Blocks & registry
export * from './registry/types'
export { BlockRegistry } from './registry/registry'
export { parseDocument } from './registry/parse'
export * from './blocks'

// Editor
export { createEditor, type Editor, type EditorState, type ChangeListener } from './editor/editor'
export { CanvasEditor, CanvasViewer } from './editor/canvas-editor'
export * from './editor/context'
export { persistEditor } from './editor/persistence'

export { sampleDocument } from './demo/sample-document'
