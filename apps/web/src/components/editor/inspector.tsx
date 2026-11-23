import {
  useEditor,
  useNode,
  useSelectedId,
  useUpdateProps,
  type AbsolutePlacement,
  type NodeId,
} from '@valley/canvas'
import { cn, Field, IconButton, NumberField, ScrollArea, Section, Tabs } from '@valley/ui'
import { Eye, EyeOff, Layers2, Maximize2, MousePointerClick, RotateCw, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { ProjectSettings } from './project-settings'
import { GalleryControls, ThemeGroupSection } from './theme-controls'

export type InspectorTab = 'component' | 'project'

export function Inspector({
  tab,
  onTabChange,
  header,
  onDelete,
}: {
  tab: InspectorTab
  onTabChange: (tab: InspectorTab) => void
  /** Rendered above the tabs, inside the sticky toolbar. */
  header?: ReactNode
  onDelete?: () => Promise<void>
}) {
  return (
    <Tabs.Root
      value={tab}
      onValueChange={(value) => onTabChange(value as InspectorTab)}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className={cn('shrink-0 border-b border-line', !header && 'pt-2')}>
        {header}
        <Tabs.List>
          <Tabs.Tab value="component">Component</Tabs.Tab>
          <Tabs.Tab value="project">Project</Tabs.Tab>
        </Tabs.List>
      </div>
      <ScrollArea className="flex-1" contentClassName="pb-14">
        <Tabs.Panel value="component">
          <ComponentPanel />
        </Tabs.Panel>
        <Tabs.Panel value="project">
          <ProjectSettings onDelete={onDelete} />
        </Tabs.Panel>
      </ScrollArea>
    </Tabs.Root>
  )
}

function ComponentPanel() {
  const selectedId = useSelectedId()
  if (!selectedId) {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-16 text-center text-small">
        <MousePointerClick className="size-6" opacity={0.32} />
        <span className="text-fg/32">Select a block on the canvas to edit it</span>
      </div>
    )
  }

  // Keyed so local state inside block inspectors resets between nodes.
  return <NodeInspector key={selectedId} id={selectedId} />
}

function NodeInspector({ id }: { id: NodeId }) {
  const editor = useEditor()
  const node = useNode(id)
  const update = useUpdateProps(id)
  if (!node) return null
  const definition = editor.registry.get(node.type)
  const BlockInspector = definition.Inspector
  const BlockInspectorFooter = definition.InspectorFooter
  const Icon = definition.icon

  return (
    <div className="flex flex-col">
      <div className="flex h-11 items-center gap-2 border-b border-line pr-2 pl-4">
        <Icon className="size-4 shrink-0" opacity={0.63} />
        <h3 className="min-w-0 flex-1 truncate text-body font-medium text-fg">
          {editor.registry.titleOf(node)}
        </h3>
        <IconButton
          size="bar"
          aria-label={node.hidden ? 'Show' : 'Hide'}
          aria-pressed={!!node.hidden}
          onClick={() => editor.commands.setHidden(id, !node.hidden)}
        >
          {node.hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </IconButton>
        <IconButton size="bar" aria-label="Deselect" onClick={() => editor.select(null)}>
          <X className="size-4" />
        </IconButton>
      </div>
      {BlockInspector && (
        <BlockInspector node={node as never} props={node.props as never} update={update} />
      )}
      {definition.themeGroups?.includes('gallery') && (
        <ThemeGroupSection
          group="gallery"
          title="Styling"
          override={node.overrides?.gallery}
          onOverrideChange={(value, options) =>
            editor.commands.setOverride(id, 'gallery', value, options)
          }
        >
          {(value, set) => (
            <GalleryControls value={value} onChange={set} showLayout={node.type !== 'island'} />
          )}
        </ThemeGroupSection>
      )}
      {BlockInspectorFooter && (
        <BlockInspectorFooter node={node as never} props={node.props as never} update={update} />
      )}
      {node.placement.mode === 'absolute' && (
        <PlacementSection id={id} placement={node.placement} />
      )}
    </div>
  )
}

/** Generic for every absolutely placed node, whatever its type. */
function PlacementSection({ id, placement }: { id: NodeId; placement: AbsolutePlacement }) {
  const editor = useEditor()

  const set = (patch: Partial<AbsolutePlacement>) =>
    editor.commands.setPlacement(id, { ...placement, ...patch }, { mergeKey: `placement.${id}` })

  return (
    <Section title="Placement">
      <Field label="Size">
        <NumberField
          label="Size"
          icon={<Maximize2 opacity={0.63} />}
          value={placement.width}
          min={0.03}
          max={0.6}
          step={0.01}
          format={{ style: 'percent' }}
          onChange={(width) => set({ width })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Rotation">
          <NumberField
            label="Rotation"
            icon={<RotateCw opacity={0.63} />}
            value={placement.rotation}
            min={-180}
            max={180}
            format={{ style: 'unit', unit: 'degree' }}
            onChange={(rotation) => set({ rotation })}
          />
        </Field>
        <Field label="Layer">
          <NumberField
            label="Layer"
            icon={<Layers2 opacity={0.63} />}
            value={placement.z}
            min={0}
            max={10}
            onChange={(z) => set({ z })}
          />
        </Field>
      </div>
    </Section>
  )
}
