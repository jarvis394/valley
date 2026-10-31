import { Copy, MousePointerClick, Trash2 } from 'lucide-react'
import type { NodeId } from '../core/ids'
import type { AbsolutePlacement } from '../core/placement'
import type { ReactNode } from 'react'
import { useNode } from '../render/context'
import { useEditor, useSelectedId, useUpdateProps } from './context'
import { ProjectSettings } from './project-settings'
import { GalleryControls, ThemeGroupSection, TypographyControls } from './theme-controls'
import { Field, IconButton, Section, SliderField, Tabs } from '@valley/ui'

export type InspectorTab = 'component' | 'project'

export function Inspector({
  tab,
  onTabChange,
  header,
}: {
  tab: InspectorTab
  onTabChange: (tab: InspectorTab) => void
  /** Rendered above the tabs, inside the sticky toolbar. */
  header?: ReactNode
}) {
  return (
    <Tabs.Root
      value={tab}
      onValueChange={(value) => onTabChange(value as InspectorTab)}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="shrink-0 border-b border-line">
        {header}
        <Tabs.List className={header ? undefined : 'pt-2'}>
          <Tabs.Tab value="component">Component</Tabs.Tab>
          <Tabs.Tab value="project">Project</Tabs.Tab>
        </Tabs.List>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-14">
        <Tabs.Panel value="component">
          <ComponentPanel />
        </Tabs.Panel>
        <Tabs.Panel value="project">
          <ProjectSettings />
        </Tabs.Panel>
      </div>
    </Tabs.Root>
  )
}

function ComponentPanel() {
  const selectedId = useSelectedId()
  if (!selectedId) {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-16 text-center text-[13px] text-fg/32">
        <MousePointerClick className="size-6" />
        Select a block on the canvas to edit it
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
  const Icon = definition.icon

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 pt-2.5 pr-3 pb-1.5 pl-4">
        <Icon className="size-4 shrink-0 text-fg/63" />
        <h3 className="flex h-7 min-w-0 flex-1 items-center truncate text-[15px] leading-5 font-medium text-fg">
          {editor.registry.titleOf(node)}
        </h3>
        <IconButton size="sm" title="Duplicate" onClick={() => editor.commands.duplicateNode(id)}>
          <Copy className="size-4" />
        </IconButton>
        <IconButton
          size="sm"
          variant="danger"
          title="Delete"
          onClick={() => editor.commands.removeNode(id)}
        >
          <Trash2 className="size-4" />
        </IconButton>
      </div>
      {BlockInspector && (
        <BlockInspector node={node as never} props={node.props as never} update={update} />
      )}
      {definition.themeGroups?.includes('typography') && (
        <ThemeGroupSection
          group="typography"
          title="Typography"
          override={node.overrides?.typography}
          onOverrideChange={(value) => editor.commands.setOverride(id, 'typography', value)}
        >
          {(value, set) => <TypographyControls value={value} onChange={set} />}
        </ThemeGroupSection>
      )}
      {definition.themeGroups?.includes('gallery') && (
        <ThemeGroupSection
          group="gallery"
          title="Gallery Style"
          override={node.overrides?.gallery}
          onOverrideChange={(value) => editor.commands.setOverride(id, 'gallery', value)}
        >
          {(value, set) => <GalleryControls value={value} onChange={set} />}
        </ThemeGroupSection>
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
        <SliderField
          value={placement.width}
          min={0.03}
          max={0.6}
          step={0.01}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={(width) => set({ width })}
        />
      </Field>
      <Field label="Rotation">
        <SliderField
          value={placement.rotation}
          min={-180}
          max={180}
          format={(v) => `${v}°`}
          onChange={(rotation) => set({ rotation })}
        />
      </Field>
      <Field label="Layer">
        <SliderField value={placement.z} min={0} max={10} onChange={(z) => set({ z })} />
      </Field>
    </Section>
  )
}
