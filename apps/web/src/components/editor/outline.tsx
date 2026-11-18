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
  cn,
  Dropzone,
  FileInput,
  IconButton,
  ListItem,
  ListItemMeta,
  ListItemRow,
  Menu,
  PlusIcon,
  ScrollArea,
} from '@valley/ui'
import { ChevronDown, Eye, EyeOff, Upload } from 'lucide-react'
import { useRef, useState, type ReactElement } from 'react'

/**
 * Left-hand block list, a second view of the same tree with its own DnD context. Page blocks
 * are sortable; the slot children of a slot container are listed, indented, under it.
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
                onNavigate={navigate}
              />
            ))}
          </div>
        </BlockDragProvider>
        {absoluteIds.length > 0 && (
          <>
            <div className="px-3 pt-2 text-small text-fg/32">Floating</div>
            {absoluteIds.map((id) => (
              <OutlineItem key={id} id={id} onClick={() => navigate(id)} onNavigate={navigate} />
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
  onNavigate,
}: {
  id: NodeId
  index: number
  count: number
  parentId: NodeId
  onClick: () => void
  onNavigate: (id: NodeId) => void
}) {
  const dropEdge = useDropEdge(parentId, index, count)
  const { ref, isDragSource } = useFlowDraggable(id)

  return (
    <div className="relative" {...dropItemProps}>
      <OutlineItem
        ref={ref}
        id={id}
        onClick={onClick}
        onNavigate={onNavigate}
        dimmed={isDragSource}
      />
      <DropLine edge={dropEdge} inset={8} gap={4} />
    </div>
  )
}

/** A row, its visibility toggle, and the slot children of a slot container below it. */
function OutlineItem({
  id,
  onClick,
  onNavigate,
  dimmed,
  depth = 0,
  ref,
}: {
  id: NodeId
  onClick: () => void
  onNavigate?: (id: NodeId) => void
  dimmed?: boolean
  depth?: number
  ref?: (element: Element | null) => void
}) {
  const editor = useEditor()
  const node = useNode(id)
  const selected = useEditorState((state) => state.selectedId === id)
  const [expanded, setExpanded] = useState(true)
  if (!node) return null
  const definition = editor.registry.get(node.type)
  const Icon = definition.icon
  const described = definition.describe?.(node as never)
  const MetaIcon = described?.metaIcon
  const slotIds = editor.registry.slotsOf(node).length > 0 ? (node.children ?? []) : []
  const title = editor.registry.titleOf(node)

  return (
    <>
      <ListItemRow>
        <ListItem
          ref={ref}
          onClick={onClick}
          selected={selected}
          dimmed={dimmed}
          muted={node.hidden}
          icon={
            <Icon
              className={cn(
                'size-4',
                slotIds.length > 0 &&
                  'group-hover/list-row:invisible group-has-focus-visible/list-row:invisible',
              )}
            />
          }
          label={title}
          className={cn(
            node.hidden
              ? 'pr-10'
              : 'group-hover/list-row:pr-10 group-has-focus-visible/list-row:pr-10',
            depth > 0 && 'pl-9',
          )}
          end={
            !node.hidden &&
            described?.meta && (
              <ListItemMeta className="group-hover/list-row:hidden group-has-focus-visible/list-row:hidden">
                {described.meta}
                {MetaIcon && <MetaIcon className="size-3.5" />}
              </ListItemMeta>
            )
          }
        />
        {slotIds.length > 0 && (
          <span
            className={cn(
              'absolute top-1/2 flex -translate-y-1/2 opacity-0 group-hover/list-row:opacity-100 group-has-focus-visible/list-row:opacity-100',
              depth > 0 ? 'left-7.5' : 'left-1.5',
            )}
          >
            <IconButton
              size="sm"
              aria-label={`${expanded ? 'Collapse' : 'Expand'} ${title}`}
              aria-expanded={expanded}
              onClick={() => setExpanded(!expanded)}
            >
              <ChevronDown className={cn('size-4', !expanded && '-rotate-90')} />
            </IconButton>
          </span>
        )}
        <span
          className={cn(
            'absolute top-1/2 right-1.5 flex -translate-y-1/2',
            !node.hidden &&
              'opacity-0 group-hover/list-row:opacity-100 group-has-focus-visible/list-row:opacity-100',
          )}
        >
          <IconButton
            size="sm"
            aria-label={`${node.hidden ? 'Show' : 'Hide'} ${title}`}
            aria-pressed={!!node.hidden}
            onClick={() => editor.commands.setHidden(id, !node.hidden)}
          >
            {node.hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </IconButton>
        </span>
      </ListItemRow>
      {expanded &&
        slotIds.map((slotId) => (
          <OutlineItem
            key={slotId}
            id={slotId}
            depth={depth + 1}
            onClick={() => onNavigate?.(slotId)}
            onNavigate={onNavigate}
          />
        ))}
    </>
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
