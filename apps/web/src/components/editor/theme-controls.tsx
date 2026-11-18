import {
  ITEM_SIZE_PRESETS,
  MAX_ITEM_SIZE,
  MAX_ROUNDNESS,
  MAX_SPACING,
  MIN_ITEM_SIZE,
  resolveThemeGroup,
  ROUNDNESS_PRESETS,
  SPACING_PRESETS,
  useTheme,
  type GalleryStyle,
  type Theme,
  type ThemeGroup,
} from '@valley/canvas'
import { cn, Field, NumberField, Section, TilePicker } from '@valley/ui'
import { Maximize2, SquareRoundCorner, UnfoldHorizontal } from 'lucide-react'
import type { ReactNode } from 'react'

/** Passed with edits that arrive in a stream (a scrub), so undo takes them back as one. */
export type ChangeOptions = { mergeKey?: string }

/**
 * A section editing one theme group. With `override` semantics (inside a block) it shows the
 * effective value and a reset button while the block deviates from the project theme.
 */
export function ThemeGroupSection<K extends ThemeGroup>({
  group,
  title,
  override,
  onOverrideChange,
  children,
}: {
  group: K
  title: string
  override: Partial<Theme[K]> | undefined
  onOverrideChange: (next: Partial<Theme[K]> | undefined, options?: ChangeOptions) => void
  children: (
    value: Theme[K],
    set: (patch: Partial<Theme[K]>, options?: ChangeOptions) => void,
  ) => ReactNode
}) {
  const theme = useTheme()
  const value = resolveThemeGroup(theme, group, override)

  return (
    <Section title={title}>
      {children(value, (patch, options) => onOverrideChange({ ...override, ...patch }, options))}
    </Section>
  )
}

const Tile = ({ className }: { className?: string }) => (
  <span className={cn('min-h-0 min-w-0 rounded-[1px] bg-current/40', className)} />
)

const TileRow = ({ grows }: { grows: string[] }) => (
  <span className="flex flex-1 gap-0.5">
    {grows.map((grow, index) => (
      <Tile key={index} className={grow} />
    ))}
  </span>
)

const TileColumn = ({ grows }: { grows: string[] }) => (
  <span className="flex flex-1 flex-col gap-0.5">
    {grows.map((grow, index) => (
      <Tile key={index} className={grow} />
    ))}
  </span>
)

const layoutOptions = [
  {
    value: 'justified',
    label: 'Justified',
    preview: (
      <span className="flex size-full flex-col gap-0.5">
        <TileRow grows={['grow-3', 'grow-2', 'grow-4']} />
        <TileRow grows={['grow-2', 'grow-4', 'grow-2']} />
      </span>
    ),
  },
  {
    value: 'grid',
    label: 'Grid',
    preview: (
      <span className="grid size-full grid-cols-3 grid-rows-2 gap-0.5">
        {['a', 'b', 'c', 'd', 'e', 'f'].map((key) => (
          <Tile key={key} />
        ))}
      </span>
    ),
  },
  {
    value: 'masonry',
    label: 'Masonry',
    preview: (
      <span className="flex size-full gap-0.5">
        <TileColumn grows={['grow-3', 'grow-2']} />
        <TileColumn grows={['grow-2', 'grow-3', 'grow-2']} />
        <TileColumn grows={['grow-2', 'grow-3']} />
      </span>
    ),
  },
  {
    value: 'horizontal',
    label: 'Row',
    preview: (
      <span className="flex size-full items-center gap-0.5 overflow-hidden">
        <Tile className="h-full w-1/3 shrink-0" />
        <Tile className="h-full w-1/4 shrink-0" />
        <Tile className="h-full w-1/3 shrink-0" />
      </span>
    ),
  },
] as const

export function GalleryControls({
  value,
  onChange,
}: {
  value: GalleryStyle
  onChange: (patch: Partial<GalleryStyle>, options?: ChangeOptions) => void
}) {
  return (
    <>
      <Field label="Grid">
        <TilePicker
          value={value.layout}
          options={layoutOptions}
          columns={2}
          size="sm"
          onChange={(layout) => onChange({ layout })}
        />
      </Field>
      <Field label="Item size">
        <NumberField
          label="Item size"
          icon={<Maximize2 opacity={0.63} />}
          value={value.size}
          min={MIN_ITEM_SIZE}
          max={MAX_ITEM_SIZE}
          step={4}
          presets={ITEM_SIZE_PRESETS}
          onChange={(size) => onChange({ size }, { mergeKey: 'gallery.size' })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Spacing">
          <NumberField
            label="Spacing"
            icon={<UnfoldHorizontal opacity={0.63} />}
            value={value.spacing}
            min={0}
            max={MAX_SPACING}
            presets={SPACING_PRESETS}
            onChange={(spacing) => onChange({ spacing }, { mergeKey: 'gallery.spacing' })}
          />
        </Field>
        <Field label="Roundness">
          <NumberField
            label="Roundness"
            icon={<SquareRoundCorner opacity={0.63} />}
            value={value.roundness}
            min={0}
            max={MAX_ROUNDNESS}
            presets={ROUNDNESS_PRESETS}
            onChange={(roundness) => onChange({ roundness }, { mergeKey: 'gallery.roundness' })}
          />
        </Field>
      </div>
    </>
  )
}
