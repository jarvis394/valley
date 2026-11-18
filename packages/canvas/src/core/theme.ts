import { z } from 'zod'

export type SizeScale = 'small' | 'medium' | 'large'

/** Converts a value saved as a size name, before the setting took pixels. */
const fromScale = (byScale: Record<SizeScale, number>) => (value: unknown) =>
  typeof value === 'string' ? byScale[value as SizeScale] : value

const pixelsSchema = (max: number, min = 0) => z.number().int().min(min).max(max)

/** Body text size the page's other type (captions, meta lines) is measured from. */
export const BASE_FONT_SIZE = 16
export const MIN_FONT_SIZE = 8
export const MAX_FONT_SIZE = 160

export const FONT_SIZE_PRESETS = [
  { label: 'Caption', value: 12 },
  { label: 'Small', value: 14 },
  { label: 'Body', value: 16 },
  { label: 'Large', value: 20 },
  { label: 'Heading', value: 24 },
  { label: 'Title', value: 32 },
  { label: 'Display', value: 48 },
  { label: 'Hero', value: 64 },
] as const

export const textStyleSchema = z.object({
  font: z.string(),
  weight: z.number().int().min(100).max(900),
  fontSize: pixelsSchema(MAX_FONT_SIZE, MIN_FONT_SIZE),
  /** A multiple of the font size; null lets the font decide ("Auto"). */
  lineHeight: z.number().min(0.5).max(3).nullable(),
  /** A fraction of the font size, as design tools show it in percent. */
  letterSpacing: z.number().min(-0.2).max(0.5),
})

export type TextStyle = z.infer<typeof textStyleSchema>

export const TEXT_ROLES = ['heading', 'body'] as const
export type TextRole = (typeof TEXT_ROLES)[number]

const typographyFields = z.object({ heading: textStyleSchema, body: textStyleSchema })

const FONT_SIZE_BY_SCALE: Record<SizeScale, number> = { small: 14, medium: 16, large: 19 }

/**
 * Typography was once one heading font, one body font and a size (earlier, a size name).
 * Headings drew at 1.5 times the body size.
 */
function migrateTypography(value: unknown) {
  if (!value || typeof value !== 'object' || 'heading' in value) return value
  const old = value as {
    headingFont?: string
    bodyFont?: string
    fontSize?: number
    scale?: unknown
  }
  const fontSize = old.fontSize ?? (fromScale(FONT_SIZE_BY_SCALE)(old.scale) as number) ?? 16

  return {
    heading: {
      font: old.headingFont ?? 'google-sans-flex',
      weight: 600,
      fontSize: Math.round(fontSize * 1.5),
      lineHeight: null,
      letterSpacing: 0,
    },
    body: {
      font: old.bodyFont ?? 'geist',
      weight: 400,
      fontSize,
      lineHeight: 1.5,
      letterSpacing: 0,
    },
  }
}

export const typographySchema = z.preprocess(migrateTypography, typographyFields)

export type Typography = z.infer<typeof typographyFields>

export const GALLERY_LAYOUTS = ['justified', 'grid', 'masonry', 'horizontal'] as const

export const galleryLayoutSchema = z.preprocess(
  // `files` was a layout before the editor always showed files; it read closest to justified.
  (value) => (value === 'files' ? 'justified' : value),
  z.enum(GALLERY_LAYOUTS),
)

export type GalleryLayout = (typeof GALLERY_LAYOUTS)[number]

export const ITEM_SIZE_PRESETS = [
  { label: 'Small', value: 160 },
  { label: 'Medium', value: 240 },
  { label: 'Large', value: 360 },
] as const

export const SPACING_PRESETS = [
  { label: 'Small', value: 2 },
  { label: 'Medium', value: 12 },
  { label: 'Large', value: 24 },
] as const

export const ROUNDNESS_PRESETS = [
  { label: 'None', value: 0 },
  { label: 'Small', value: 4 },
  { label: 'Medium', value: 8 },
  { label: 'Large', value: 16 },
] as const

const ITEM_SIZE_BY_SCALE: Record<SizeScale, number> = { small: 160, medium: 240, large: 360 }
const SPACING_BY_SCALE: Record<SizeScale, number> = { small: 2, medium: 12, large: 24 }

export const MIN_ITEM_SIZE = 64
export const MAX_ITEM_SIZE = 640
export const MAX_SPACING = 64
export const MAX_ROUNDNESS = 64

export const gallerySchema = z.object({
  layout: galleryLayoutSchema,
  /** How big each item is drawn: row height or column width, by layout. */
  size: z.preprocess(fromScale(ITEM_SIZE_BY_SCALE), pixelsSchema(MAX_ITEM_SIZE, MIN_ITEM_SIZE)),
  spacing: z.preprocess(fromScale(SPACING_BY_SCALE), pixelsSchema(MAX_SPACING)),
  roundness: pixelsSchema(MAX_ROUNDNESS),
})

export type GalleryStyle = z.infer<typeof gallerySchema>

export const themeSchema = z.object({
  typography: typographySchema,
  // Themes saved before `size` existed get the default.
  gallery: z.preprocess((value) => ({ size: 240, ...(value as object) }), gallerySchema),
})

export type Theme = z.infer<typeof themeSchema>

/**
 * Project-level design tokens. Blocks store *partial overrides* of the groups listed here;
 * the effective value is `{ ...theme.group, ...block.override }`. Clearing an override
 * (the "reset" button in the inspector) makes the block follow the project again.
 * Text styles live on each text block instead, as overrides of a role.
 */
export const themeOverridesSchema = z.object({
  gallery: gallerySchema.partial().optional(),
})

export type ThemeOverrides = z.infer<typeof themeOverridesSchema>

/** Every theme group a block may override. Add a group here and it becomes overridable. */
export type ThemeGroup = keyof ThemeOverrides

export const defaultTheme: Theme = {
  typography: {
    heading: {
      font: 'google-sans-flex',
      weight: 600,
      fontSize: 24,
      lineHeight: null,
      letterSpacing: 0,
    },
    body: {
      font: 'geist',
      weight: 400,
      fontSize: BASE_FONT_SIZE,
      lineHeight: 1.5,
      letterSpacing: 0,
    },
  },
  gallery: { layout: 'justified', size: 240, spacing: 12, roundness: 4 },
}

export function resolveThemeGroup<K extends ThemeGroup>(
  theme: Theme,
  group: K,
  override: Partial<Theme[K]> | undefined,
): Theme[K] {
  if (!override) return theme[group]
  const defined = Object.fromEntries(
    Object.entries(override).filter(([, value]) => value !== undefined),
  ) as Partial<Theme[K]>

  return { ...theme[group], ...defined }
}
