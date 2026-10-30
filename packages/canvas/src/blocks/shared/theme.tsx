import { useMemo, type CSSProperties, type ReactNode } from 'react'
import { z } from 'zod'
import { FONTS, getFont } from '../../core/fonts'
import {
  gallerySchema,
  hasOverride,
  resolveThemeGroup,
  ROUNDNESS,
  SCALE_FACTOR,
  typographySchema,
  type GalleryStyle,
  type Theme,
  type ThemeGroup,
  type ThemeOverrides,
  type Typography,
} from '../../core/theme'
import { useTheme } from '../../editor/context'
import { Field, type Option, Section, Segmented, SelectField } from '@valley/ui'

/** Schema fragment blocks embed to opt into theme overrides for specific groups. */
export const overridesSchema = z.object({
  typography: typographySchema.partial().optional(),
  gallery: gallerySchema.partial().optional(),
})

export function useResolvedTheme(overrides: ThemeOverrides | undefined): Theme {
  const theme = useTheme()
  return useMemo(
    () => ({
      typography: resolveThemeGroup(theme, 'typography', overrides?.typography),
      gallery: resolveThemeGroup(theme, 'gallery', overrides?.gallery),
    }),
    [theme, overrides],
  )
}

/** Exposes typography as CSS variables so nested markup can use `var(--font-heading)` etc. */
export const typographyStyle = (typography: Typography): CSSProperties =>
  ({
    '--font-heading': getFont(typography.headingFont).family,
    '--font-body': getFont(typography.bodyFont).family,
    '--type-scale': SCALE_FACTOR[typography.scale],
    fontFamily: 'var(--font-body)',
  }) as CSSProperties

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
  onOverrideChange: (next: Partial<Theme[K]> | undefined) => void
  children: (value: Theme[K], set: (patch: Partial<Theme[K]>) => void) => ReactNode
}) {
  const theme = useTheme()
  const value = resolveThemeGroup(theme, group, override)
  return (
    <Section
      title={title}
      onReset={hasOverride(override) ? () => onOverrideChange(undefined) : undefined}
    >
      {children(value, (patch) => onOverrideChange({ ...override, ...patch }))}
    </Section>
  )
}

const fontOptions: Option<string>[] = FONTS.map((font) => ({ value: font.id, label: font.label }))
const scaleOptions = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
] as const

export function TypographyControls({
  value,
  onChange,
}: {
  value: Typography
  onChange: (patch: Partial<Typography>) => void
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Header font">
          <SelectField
            value={value.headingFont}
            options={fontOptions}
            onChange={(headingFont) => onChange({ headingFont })}
            renderItem={(o) => (
              <span style={{ fontFamily: getFont(o.value).family }}>{o.label}</span>
            )}
          />
        </Field>
        <Field label="Content font">
          <SelectField
            value={value.bodyFont}
            options={fontOptions}
            onChange={(bodyFont) => onChange({ bodyFont })}
            renderItem={(o) => (
              <span style={{ fontFamily: getFont(o.value).family }}>{o.label}</span>
            )}
          />
        </Field>
      </div>
      <Field label="Scaling">
        <Segmented
          value={value.scale}
          options={scaleOptions}
          onChange={(scale) => onChange({ scale })}
        />
      </Field>
    </>
  )
}

const layoutOptions = [
  { value: 'grid', label: 'Grid' },
  { value: 'masonry', label: 'Masonry' },
  { value: 'horizontal', label: 'Row' },
  { value: 'files', label: 'Files' },
] as const
const roundnessOptions = ROUNDNESS.map((r) => ({ value: r, label: r === 0 ? 'None' : `${r}px` }))

export function GalleryControls({
  value,
  onChange,
}: {
  value: GalleryStyle
  onChange: (patch: Partial<GalleryStyle>) => void
}) {
  return (
    <>
      <Field label="Grid">
        <Segmented
          value={value.layout}
          options={layoutOptions}
          onChange={(layout) => onChange({ layout })}
        />
      </Field>
      <Field label="Spacing">
        <Segmented
          value={value.spacing}
          options={scaleOptions}
          onChange={(spacing) => onChange({ spacing })}
        />
      </Field>
      <Field label="Roundness">
        <Segmented
          value={value.roundness}
          options={roundnessOptions}
          onChange={(roundness) => onChange({ roundness })}
        />
      </Field>
    </>
  )
}
