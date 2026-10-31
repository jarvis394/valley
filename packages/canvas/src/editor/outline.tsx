import { useDraggable } from '@dnd-kit/react'
import { Upload } from 'lucide-react'
import { useRef, type ReactNode } from 'react'
import type { NodeId } from '../core/ids'
import { useChildIds, useDocumentState, useNode } from '../render/context'
import { useEditor, useEditorState } from './context'
import {
  BlockDragProvider,
  DRAG_TYPE,
  DropLine,
  dropContainerProps,
  dropItemProps,
  useDropEdge,
  type DragData,
} from './dnd'
import { cn, IconButton, ListItem, ListItemMeta, Menu, PlusIcon } from '@valley/ui'

const scrollToNode = (id: NodeId) =>
  document
    .querySelector(`[data-node-id="${id}"]`)
    ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })

/**
 * Left-hand block list, a second view of the same tree with its own DnD context. It shows
 * only the root level. The drag-end handler already moves nodes across sortable groups,
 * so nesting needs one group per container.
 */
export function Outline({ onNavigate }: { onNavigate?: () => void }) {
  const editor = useEditor()
  const rootId = useDocumentState((state) => state.doc.rootId)
  const { flow: flowIds, absolute: absoluteIds } = useChildIds(rootId)
  const navigate = (id: NodeId) => {
    editor.select(id)
    scrollToNode(id)
    onNavigate?.()
  }

  return (
    <div className="flex flex-col pb-2">
      <div className="flex items-center gap-2 pt-2.5 pr-3 pb-1.5 pl-4">
        <span className="flex h-7 flex-1 items-center text-[15px] leading-5 text-fg/32">
          Blocks
        </span>
        <AddBlockMenu
          trigger={
            <Menu.Trigger render={<IconButton size="sm" aria-label="Add block" />}>
              <PlusIcon />
            </Menu.Trigger>
          }
        />
      </div>
      <div className="flex flex-col gap-1 px-1.5">
        <BlockDragProvider>
          <div className="flex flex-col gap-1" {...dropContainerProps(rootId)}>
            {flowIds.map((id, index) => (
              <SortableOutlineItem
                key={id}
                id={id}
                index={index}
                count={flowIds.length}
                parentId={rootId}
                onClick={() => navigate(id)}
              />
            ))}
          </div>
        </BlockDragProvider>
        {absoluteIds.length > 0 && (
          <>
            <div className="px-3 pt-2 text-[13px] text-fg/32">Floating</div>
            {absoluteIds.map((id) => (
              <OutlineItem key={id} id={id} onClick={() => navigate(id)} />
            ))}
          </>
        )}
        <AddBlockDropzone />
      </div>
    </div>
  )
}

function SortableOutlineItem({
  id,
  index,
  count,
  parentId,
  onClick,
}: {
  id: NodeId
  index: number
  count: number
  parentId: NodeId
  onClick: () => void
}) {
  const dropEdge = useDropEdge(parentId, index, count)
  const { ref, isDragSource } = useDraggable<DragData>({
    id,
    type: DRAG_TYPE.flow,
    data: { kind: 'flow-node', nodeId: id },
  })
  return (
    <div className="relative" {...dropItemProps}>
      <OutlineItem ref={ref} id={id} onClick={onClick} dimmed={isDragSource} />
      <DropLine edge={dropEdge} inset={8} gap={4} />
    </div>
  )
}

function OutlineItem({
  id,
  onClick,
  dimmed,
  ref,
}: {
  id: NodeId
  onClick: () => void
  dimmed?: boolean
  ref?: (element: Element | null) => void
}) {
  const editor = useEditor()
  const node = useNode(id)
  const selected = useEditorState((state) => state.selectedId === id)
  if (!node) return null
  const definition = editor.registry.get(node.type)
  const Icon = definition.icon
  const described = definition.describe?.(node as never)
  const MetaIcon = described?.metaIcon

  return (
    <ListItem
      ref={ref}
      onClick={onClick}
      selected={selected}
      className={cn(dimmed && 'opacity-50')}
      icon={<Icon className="size-4" />}
      label={editor.registry.titleOf(node)}
      end={
        described?.meta && (
          <ListItemMeta>
            {described.meta}
            {MetaIcon && <MetaIcon className="size-3.5" />}
          </ListItemMeta>
        )
      }
    />
  )
}

/** Menu of insertable blocks, built from the registry. */
export function AddBlockMenu({
  trigger,
  children,
}: {
  trigger: React.ReactElement
  /** Extra items appended after the block types. */
  children?: ReactNode
}) {
  const editor = useEditor()
  return (
    <Menu.Root>
      {trigger}
      <Menu.Popup>
        {editor.registry.insertable().map((definition) => {
          const Icon = definition.icon
          return (
            <Menu.Item
              key={definition.type}
              onClick={() => {
                const id = editor.commands.insertBlock(definition.type)
                if (id) requestAnimationFrame(() => scrollToNode(id))
              }}
            >
              <Icon className="size-4 text-fg/63" />
              <span className="flex-1">{definition.label}</span>
              {definition.experimental && (
                <span className="rounded bg-amber-400/15 px-1.5 py-0.5 text-[10px] text-amber-300 uppercase">
                  beta
                </span>
              )}
            </Menu.Item>
          )
        })}
        {children}
      </Menu.Popup>
    </Menu.Root>
  )
}

/** "Add block or upload files": opens the block menu; dropped files go into a new block. */
function AddBlockDropzone() {
  const editor = useEditor()
  const inputRef = useRef<HTMLInputElement>(null)
  const insertFiles = async (files: FileList) => {
    const ids = await editor.commands.uploadAssets([...files])
    if (ids.length === 0) return
    editor.commands.insertFromAssets(ids, { parentId: editor.getState().doc.rootId })
  }
  return (
    <div className="py-1.5">
      <AddBlockMenu
        trigger={
          <Menu.Trigger
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault()
              void insertFiles(event.dataTransfer.files)
            }}
            className="flex h-[140px] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/7 p-3 text-[15px] leading-5 font-medium text-fg/63 outline-none hover:border-white/12 hover:text-fg focus-visible:ring-2 focus-visible:ring-accent/60 data-popup-open:border-white/12"
          >
            <PlusIcon />
            Add block or upload files
          </Menu.Trigger>
        }
      >
        <Menu.Separator />
        <Menu.Item onClick={() => inputRef.current?.click()}>
          <Upload className="size-4 text-fg/63" />
          Upload files
        </Menu.Item>
      </AddBlockMenu>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          const { files } = event.currentTarget
          if (files?.length) void insertFiles(files)
          event.currentTarget.value = ''
        }}
      />
    </div>
  )
}
