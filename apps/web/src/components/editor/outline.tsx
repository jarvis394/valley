import {
  BlockDragProvider,
  DropLine,
  dropContainerProps,
  dropItemProps,
  scrollToNode,
  useChildIds,
  useDocumentState,
  useDropEdge,
  useEditor,
  useEditorState,
  useFlowDraggable,
  useNode,
  type NodeId,
} from '@valley/canvas'
import {
  Badge,
  Dropzone,
  FileInput,
  IconButton,
  ListItem,
  ListItemMeta,
  Menu,
  PlusIcon,
  ScrollArea,
} from '@valley/ui'
import { Upload } from 'lucide-react'
import { useRef, type ReactElement } from 'react'

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
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-11 shrink-0 items-center gap-2 pr-2 pl-4">
        <span className="flex-1 text-body text-fg/32">Blocks</span>
        <AddBlockMenu
          trigger={
            <Menu.Trigger render={<IconButton size="bar" aria-label="Add block" />}>
              <PlusIcon />
            </Menu.Trigger>
          }
        />
      </div>
      <ScrollArea className="flex-1" contentClassName="flex flex-col gap-1 px-1.5 pb-2">
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
            <div className="px-3 pt-2 text-small text-fg/32">Floating</div>
            {absoluteIds.map((id) => (
              <OutlineItem key={id} id={id} onClick={() => navigate(id)} />
            ))}
          </>
        )}
        <AddBlockDropzone />
      </ScrollArea>
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
  const { ref, isDragSource } = useFlowDraggable(id)

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
      dimmed={dimmed}
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

/** Menu of insertable blocks, built from the registry, followed by an upload action. */
export function AddBlockMenu({ trigger }: { trigger: ReactElement }) {
  const editor = useEditor()
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <Menu.Root>
      {trigger}
      <Menu.Popup>
        {editor.registry.insertable().map((definition) => {
          const Icon = definition.icon

          return (
            <Menu.Item
              key={definition.type}
              icon={<Icon className="size-4" />}
              onClick={() => {
                const id = editor.commands.insertBlock(definition.type)
                if (id) requestAnimationFrame(() => scrollToNode(id))
              }}
            >
              <span className="flex-1">{definition.label}</span>
              {definition.experimental && <Badge variant="warning">beta</Badge>}
            </Menu.Item>
          )
        })}
        <Menu.Separator />
        <Menu.Item icon={<Upload className="size-4" />} onClick={() => inputRef.current?.click()}>
          Upload images
        </Menu.Item>
      </Menu.Popup>
      <FileInput
        ref={inputRef}
        multiple
        accept="image/*,video/*"
        onFiles={(files) => void editor.commands.insertFiles(files)}
      />
    </Menu.Root>
  )
}

/** "Add block or upload files": opens the block menu; dropped files go into a new block. */
function AddBlockDropzone() {
  const editor = useEditor()

  return (
    <div className="py-1.5">
      <AddBlockMenu
        trigger={
          <Menu.Trigger
            render={
              <Dropzone
                label="Add block or upload files"
                onFiles={(files) => void editor.commands.insertFiles(files)}
              />
            }
          />
        }
      />
    </div>
  )
}
