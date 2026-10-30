import { Eye, EyeOff, Layers, Plus, Redo2, SlidersHorizontal, Undo2 } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import type { CanvasDocument } from '../core/document'
import { formatBytes } from '../core/format'
import type { BlockRegistry } from '../registry/registry'
import { Canvas } from './canvas'
import {
  EditorProvider,
  useEditor,
  useEditorState,
  useMeta,
  useMode,
  useSelectedId,
} from './context'
import { createEditor, type Editor } from './editor'
import { useEditorHotkeys } from './hotkeys'
import { Inspector } from './inspector'
import { AddBlockMenu, Outline } from './outline'
import {
  cn,
  Divider,
  IconButton,
  MenuExpandIcon,
  Menu,
  Sheet,
  SlashBackIcon,
  Switch,
} from '@valley/ui'

export interface CanvasEditorSlots {
  /** App navigation rail, left of the editor panels (desktop). */
  sidebar?: ReactNode
  /** Project-level links under the "Project" row (retouch, analytics…). */
  nav?: ReactNode
  /** Toolbar above the inspector tabs (share, visit…). */
  actions?: ReactNode
}

export function CanvasEditor({ editor, ...slots }: { editor: Editor } & CanvasEditorSlots) {
  useEditorHotkeys(editor)
  return (
    <EditorProvider editor={editor}>
      <EditorShell {...slots} />
    </EditorProvider>
  )
}

/** Read-only rendering of a document with the same block renderers (published page). */
export function CanvasViewer({ doc, registry }: { doc: CanvasDocument; registry: BlockRegistry }) {
  const [editor] = useState(() => createEditor({ doc, registry, readOnly: true }))
  // oxlint-disable-next-line valley/no-unreasoned-state-sync -- loads the doc prop into the editor store, which lives outside React
  useEffect(() => editor.load(doc), [editor, doc])
  return (
    <EditorProvider editor={editor}>
      <Canvas />
    </EditorProvider>
  )
}

type Panel = 'outline' | 'inspector'
type InspectorTab = 'component' | 'project'

function EditorShell({ sidebar, nav, actions }: CanvasEditorSlots) {
  const editor = useEditor()
  const mode = useMode()
  const selectedId = useSelectedId()
  const [tab, setTab] = useState<InspectorTab>(() => (selectedId ? 'component' : 'project'))
  const [panel, setPanel] = useState<Panel | null>(null)

  // Selecting a block jumps the inspector to its settings.
  // oxlint-disable-next-line valley/no-unreasoned-state-sync -- subscribes to selection changes in the editor store
  useEffect(
    () =>
      editor.store.subscribe((state, prev) => {
        if (state.selectedId && state.selectedId !== prev.selectedId) setTab('component')
      }),
    [editor],
  )

  if (mode === 'preview') {
    return (
      <div className="isolate min-h-dvh bg-neutral-950 text-white">
        <Canvas />
        <button
          type="button"
          onClick={() => editor.setMode('edit')}
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-fg px-4 py-2.5 text-sm font-medium text-black shadow-2xl"
        >
          <EyeOff className="size-4" /> Exit preview
        </button>
      </div>
    )
  }

  return (
    <div className="isolate flex h-dvh overflow-hidden bg-canvas text-fg">
      {sidebar && <div className="hidden xl:contents">{sidebar}</div>}

      <aside className="hidden w-80 shrink-0 flex-col border-r border-line bg-surface lg:flex">
        <ProjectHeader />
        <div className="min-h-0 flex-1 overflow-x-clip overflow-y-auto overscroll-contain">
          <div className="flex flex-col gap-1 px-1.5 py-2">
            <ProjectRow />
            {nav}
          </div>
          <Divider />
          <Outline />
        </div>
        <PreviewFooter />
      </aside>

      <main
        className="relative min-w-0 flex-1 overflow-y-auto overscroll-contain pt-5 pb-24 lg:pb-5"
        onPointerDown={() => editor.select(null)}
      >
        <div className="sticky top-0 z-30 -mt-5 mb-5 flex items-center justify-between border-b border-line bg-canvas/90 px-3 py-2 backdrop-blur lg:hidden">
          <ProjectTitle />
          <HistoryButtons />
        </div>
        <Canvas />
      </main>

      <aside className="hidden w-80 shrink-0 flex-col border-l border-line bg-surface lg:flex">
        <Inspector
          tab={tab}
          onTabChange={setTab}
          header={
            actions && (
              <div className="flex items-center justify-end gap-2 py-2.5 pr-3 pl-2">{actions}</div>
            )
          }
        />
      </aside>

      <MobileDock
        onOpen={setPanel}
        hasSelection={!!selectedId}
        onPreview={() => editor.setMode('preview')}
      />
      <Sheet
        open={panel === 'outline'}
        onOpenChange={(open) => !open && setPanel(null)}
        title="Blocks"
      >
        <Outline onNavigate={() => setPanel(null)} />
      </Sheet>
      <Sheet
        open={panel === 'inspector'}
        onOpenChange={(open) => !open && setPanel(null)}
        title="Inspector"
      >
        <Inspector tab={tab} onTabChange={setTab} />
      </Sheet>
    </div>
  )
}

function ProjectTitle() {
  const meta = useMeta()
  return <span className="truncate text-[15px] font-medium">{meta.title}</span>
}

/** The cover image is also the project's thumbnail. */
function useProjectThumbnail() {
  return useEditorState((state) => {
    const { nodes, assets } = state.doc
    const cover = Object.values(nodes).find((node) => node.type === 'cover')
    const coverAssetId = cover?.type === 'cover' ? cover.props.assetId : null
    const asset =
      (coverAssetId && assets[coverAssetId]) ||
      Object.values(assets).find((a) => a.kind === 'image')
    return asset?.kind === 'image' ? asset.src : asset?.poster
  })
}

function ProjectHeader() {
  const meta = useMeta()
  const thumbnail = useProjectThumbnail()
  return (
    <div className="flex h-[52px] shrink-0 items-center gap-3 border-b border-line px-3 py-1.5">
      {thumbnail ? (
        <img
          src={thumbnail}
          alt=""
          className="size-7 shrink-0 rounded-md border-[0.5px] border-white/4 object-cover"
        />
      ) : (
        <span className="size-7 shrink-0 rounded-md bg-white/7" />
      )}
      <span className="min-w-0 flex-1 truncate text-base leading-6 font-medium">{meta.title}</span>
      <IconButton size="sm" aria-label="Switch project" className="text-[#ededed]/63">
        <MenuExpandIcon />
      </IconButton>
    </div>
  )
}

function ProjectRow() {
  const assets = useEditorState((state) => state.doc.assets)
  const files = Object.values(assets)
  const bytes = files.reduce((sum, asset) => sum + (asset.size ?? 0), 0)
  return (
    <div className="flex h-10 items-center gap-1 rounded-xl bg-white/3 px-3 text-[15px] leading-5">
      <span className="min-w-0 flex-1 truncate font-medium">Project</span>
      <span className="flex shrink-0 items-center gap-1 tabular-nums">
        <span className="opacity-64">
          {files.length} {files.length === 1 ? 'file' : 'files'}
        </span>
        {bytes > 0 && (
          <>
            <span className="opacity-24">•</span>
            <span className="opacity-64">{formatBytes(bytes)}</span>
          </>
        )}
      </span>
    </div>
  )
}

function PreviewFooter() {
  const editor = useEditor()
  return (
    <div className="flex h-[52px] shrink-0 items-center gap-3 border-t border-line px-3 py-1.5">
      <kbd
        aria-hidden
        className="flex size-7 shrink-0 items-center justify-center rounded-md border border-white/7"
      >
        <SlashBackIcon />
      </kbd>
      <span className="min-w-0 flex-1 text-base leading-6 font-medium">Preview</span>
      <Switch
        size="lg"
        aria-label="Preview"
        checked={false}
        onChange={() => editor.setMode('preview')}
      />
    </div>
  )
}

function HistoryButtons() {
  const editor = useEditor()
  const canUndo = useEditorState((state) => state.past.length > 0)
  const canRedo = useEditorState((state) => state.future.length > 0)
  return (
    <div className="flex gap-1">
      <IconButton title="Undo (⌘Z)" disabled={!canUndo} onClick={editor.undo}>
        <Undo2 className="size-4" />
      </IconButton>
      <IconButton title="Redo (⇧⌘Z)" disabled={!canRedo} onClick={editor.redo}>
        <Redo2 className="size-4" />
      </IconButton>
    </div>
  )
}

function MobileDock({
  onOpen,
  hasSelection,
  onPreview,
}: {
  onOpen: (panel: Panel) => void
  hasSelection: boolean
  onPreview: () => void
}) {
  const item =
    'flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] text-fg/63 active:bg-white/7 disabled:opacity-30'
  return (
    <nav className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 flex gap-1 rounded-2xl border-[0.5px] border-white/7 bg-surface/95 p-1 shadow-2xl backdrop-blur lg:hidden">
      <button type="button" className={item} onClick={() => onOpen('outline')}>
        <Layers className="size-5" /> Blocks
      </button>
      <AddBlockMenu
        trigger={
          <Menu.Trigger className={item}>
            <Plus className="size-5" /> Add
          </Menu.Trigger>
        }
      />
      <button type="button" className={item} onClick={() => onOpen('inspector')}>
        <SlidersHorizontal className={cn('size-5', hasSelection && 'text-focus-fg')} /> Edit
      </button>
      <button type="button" className={item} onClick={onPreview}>
        <Eye className="size-5" /> Preview
      </button>
    </nav>
  )
}
