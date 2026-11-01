import { useMemo, type CSSProperties } from 'react'
import { getFont } from '../../core/fonts'
import {
  resolveThemeGroup,
  SCALE_FACTOR,
  type Theme,
  type ThemeOverrides,
  type Typography,
} from '../../core/theme'
import { useTheme } from '../../render/context'

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
