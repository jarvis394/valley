import { useRender } from '@base-ui/react/use-render'
import {
  Canvas,
  EditorProvider,
  formatBytes,
  summarizeAssets,
  useAssets,
  useThumbnailSrc,
  useEditor,
  useEditorHotkeys,
  useEditorState,
  useMeta,
  useMode,
  useSelectedId,
  type Editor,
} from '@valley/canvas'
import {
  Button,
  cn,
  Divider,
  IconButton,
  ListItem,
  ListItemMeta,
  Menu,
  ScrollArea,
  Sheet,
  SlashBackIcon,
  Switch,
  SwitcherBar,
  SwitcherMenu,
} from '@valley/ui'
import { Eye, EyeOff, Layers, Plus, Redo2, SlidersHorizontal, Undo2 } from 'lucide-react'
import { useEffect, useState, type ComponentProps, type ReactElement, type ReactNode } from 'react'
import { Inspector, type InspectorTab } from './inspector'
import { AddBlockMenu, Outline } from './outline'

export interface ProjectEditorSlots {
  /** Project-level links under the "Project" row (retouch, analytics…). */
  nav?: ReactNode
  /** Toolbar above the inspector tabs (share, visit…). */
  actions?: ReactNode
  /** `Menu.Item`s of the project switcher in the header. */
  switcher?: ReactNode
  /** Permanently deletes the project; the inspector asks to confirm first. */
  onDelete?: () => Promise<void>
}

/** The panels around the canvas: project outline on the left, inspector on the right. */
export function ProjectEditor({ editor, ...slots }: { editor: Editor } & ProjectEditorSlots) {
  useEditorHotkeys(editor)

  return (
    <EditorProvider editor={editor}>
      <EditorLayout {...slots} />
    </EditorProvider>
  )
}

type Panel = 'outline' | 'inspector'

function EditorLayout({ nav, actions, switcher, onDelete }: ProjectEditorSlots) {
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
    // Covers the app shell, so the preview reads like the published page.
    return (
      <div className="fixed inset-0 isolate z-50 bg-neutral-950 text-white">
        <ScrollArea scrollbar="canvas" className="h-full">
          <Canvas />
        </ScrollArea>
        <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-50 -translate-x-1/2">
          <Button
            variant="primary"
            size="md"
            icon={<EyeOff className="size-4" />}
            onClick={() => editor.setMode('edit')}
          >
            Exit preview
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="isolate flex h-full min-w-0 flex-1 overflow-hidden bg-canvas text-fg">
      <aside className="hidden w-80 shrink-0 flex-col border-r border-line bg-surface lg:flex">
        <ProjectHeader switcher={switcher} />
        <div className="flex shrink-0 flex-col gap-1 px-1.5 py-2">
          <ProjectRow />
          {nav}
        </div>
        <Divider />
        <Outline />
        <PreviewFooter />
      </aside>

      <ScrollArea
        render={<main />}
        scrollbar="canvas"
        className="min-w-0 flex-1"
        contentClassName="pb-24 lg:pb-5"
        onPointerDown={() => editor.select(null)}
      >
        <div className="sticky top-0 z-30 mb-5 flex items-center justify-between border-b border-line bg-canvas/90 px-3 py-2 backdrop-blur lg:hidden">
          <ProjectTitle />
          <HistoryButtons />
        </div>
        <Canvas />
      </ScrollArea>

      <aside className="hidden w-80 shrink-0 flex-col border-l border-line bg-surface lg:flex">
        <Inspector
          tab={tab}
          onTabChange={setTab}
          onDelete={onDelete}
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
        <Inspector tab={tab} onTabChange={setTab} onDelete={onDelete} />
      </Sheet>
    </div>
  )
}

function ProjectTitle() {
  const meta = useMeta()

  return <span className="truncate text-body font-medium">{meta.title}</span>
}

function ProjectHeader({ switcher }: { switcher?: ReactNode }) {
  const meta = useMeta()

  return (
    <div className="border-b border-line">
      <SwitcherBar
        image={useThumbnailSrc()}
        label={meta.title}
        after={switcher && <SwitcherMenu label="Switch project">{switcher}</SwitcherMenu>}
      />
    </div>
  )
}

function ProjectRow() {
  const files = summarizeAssets(useAssets())

  return (
    <ListItem
      render={<div />}
      filled
      label="Project"
      end={
        <ListItemMeta>
          {files.count} {files.count === 1 ? 'file' : 'files'}
          {files.bytes > 0 && (
            <>
              <span className="text-fg/24">•</span>
              {formatBytes(files.bytes)}
            </>
          )}
        </ListItemMeta>
      }
    />
  )
}

function PreviewFooter() {
  const editor = useEditor()

  return (
    <div className="flex h-13 shrink-0 items-center gap-3 border-t border-line px-3 py-1.5">
      <kbd
        aria-hidden
        className="flex size-7 shrink-0 items-center justify-center rounded-md border border-white/7"
      >
        <SlashBackIcon />
      </kbd>
      <span className="min-w-0 flex-1 text-title font-medium">Preview</span>
      <Switch aria-label="Preview" checked={false} onChange={() => editor.setMode('preview')} />
    </div>
  )
}

function HistoryButtons() {
  const editor = useEditor()
  const canUndo = useEditorState((state) => state.past.length > 0)
  const canRedo = useEditorState((state) => state.future.length > 0)

  return (
    <div className="flex gap-1">
      <IconButton aria-label="Undo (⌘Z)" disabled={!canUndo} onClick={editor.undo}>
        <Undo2 className="size-4" />
      </IconButton>
      <IconButton aria-label="Redo (⇧⌘Z)" disabled={!canRedo} onClick={editor.redo}>
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
  return (
    <nav className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 flex gap-1 rounded-2xl border-[0.5px] border-white/7 bg-surface/95 p-1 shadow-2xl backdrop-blur lg:hidden">
      <DockItem
        icon={<Layers className="size-5" />}
        label="Blocks"
        onClick={() => onOpen('outline')}
      />
      <AddBlockMenu
        trigger={
          <Menu.Trigger render={<DockItem icon={<Plus className="size-5" />} label="Add" />} />
        }
      />
      <DockItem
        icon={<SlidersHorizontal className="size-5" />}
        label="Edit"
        highlighted={hasSelection}
        onClick={() => onOpen('inspector')}
      />
      <DockItem icon={<Eye className="size-5" />} label="Preview" onClick={onPreview} />
    </nav>
  )
}

/** Icon over a caption. `render` swaps the button, e.g. for a menu trigger. */
function DockItem({
  icon,
  label,
  highlighted,
  render,
  ...props
}: Omit<ComponentProps<'button'>, 'children' | 'className'> & {
  icon: ReactNode
  label: string
  /** Lights the icon up, e.g. when there is a selection to edit. */
  highlighted?: boolean
  render?: ReactElement
}) {
  return useRender({
    render,
    defaultTagName: 'button',
    props: {
      ...(render ? {} : { type: 'button' }),
      ...props,
      className:
        'flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-caption text-fg/63 active:bg-white/7 disabled:opacity-30',
      children: (
        <>
          <span className={cn('flex', highlighted ? 'text-focus-fg' : 'text-fg opacity-63')}>
            {icon}
          </span>
          {label}
        </>
      ),
    },
  })
}
