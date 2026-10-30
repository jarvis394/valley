import { z } from 'zod'

/**
 * Project-level design tokens. Blocks store *partial overrides* of these groups;
 * the effective value is `{ ...theme.group, ...block.override }`. Clearing an override
 * (the "reset" button in the inspector) makes the block follow the project again.
 */
export const sizeScaleSchema = z.enum(['small', 'medium', 'large'])
export type SizeScale = z.infer<typeof sizeScaleSchema>

export const typographySchema = z.object({
  headingFont: z.string(),
  bodyFont: z.string(),
  scale: sizeScaleSchema,
})
export type Typography = z.infer<typeof typographySchema>

export const galleryLayoutSchema = z.enum(['grid', 'masonry', 'horizontal', 'files'])
export type GalleryLayout = z.infer<typeof galleryLayoutSchema>

export const ROUNDNESS = [0, 4, 6, 8, 12] as const
export const roundnessSchema = z.union(ROUNDNESS.map((r) => z.literal(r)))
export type Roundness = (typeof ROUNDNESS)[number]

export const gallerySchema = z.object({
  layout: galleryLayoutSchema,
  spacing: sizeScaleSchema,
  roundness: roundnessSchema,
})
export type GalleryStyle = z.infer<typeof gallerySchema>

export const themeSchema = z.object({
  typography: typographySchema,
  gallery: gallerySchema,
})
export type Theme = z.infer<typeof themeSchema>

/** Every theme group a block may override. Add a group here and it becomes overridable. */
export type ThemeGroup = keyof Theme
export type ThemeOverrides = { [K in ThemeGroup]?: Partial<Theme[K]> }

export const defaultTheme: Theme = {
  typography: { headingFont: 'google-sans-flex', bodyFont: 'geist', scale: 'medium' },
  gallery: { layout: 'masonry', spacing: 'medium', roundness: 4 },
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

export const hasOverride = (override: object | undefined) =>
  !!override && Object.values(override).some((value) => value !== undefined)

export const SCALE_FACTOR: Record<SizeScale, number> = { small: 0.85, medium: 1, large: 1.2 }
export const SPACING_PX: Record<SizeScale, number> = { small: 2, medium: 12, large: 24 }
