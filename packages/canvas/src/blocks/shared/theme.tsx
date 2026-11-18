import { useMemo, type CSSProperties } from 'react'
import { getFont } from '../../core/fonts'
import {
  BASE_FONT_SIZE,
  resolveThemeGroup,
  type TextStyle,
  type Theme,
  type ThemeOverrides,
  type Typography,
} from '../../core/theme'
import { useTheme } from '../../render/context'

export function useResolvedTheme(overrides: ThemeOverrides | undefined): Theme {
  const theme = useTheme()

  return useMemo(
    () => ({
      typography: theme.typography,
      gallery: resolveThemeGroup(theme, 'gallery', overrides?.gallery),
    }),
    [theme, overrides],
  )
}

const FULL_SIZE_VIEWPORT = 768

/** Full size from a tablet-wide viewport up; narrower, large sizes shrink to 60%, never below body. */
function fluidFontSize(size: number) {
  const min = Math.max(Math.min(size, BASE_FONT_SIZE), Math.round(size * 0.6))
  if (min === size) return `${size}px`

  return `clamp(${min}px, ${((size / FULL_SIZE_VIEWPORT) * 100).toFixed(2)}vw, ${size}px)`
}

export const textStyleCss = (style: TextStyle): CSSProperties => ({
  fontFamily: getFont(style.font).family,
  fontWeight: style.weight,
  fontSize: fluidFontSize(style.fontSize),
  lineHeight: style.lineHeight ?? 'normal',
  letterSpacing: `${style.letterSpacing}em`,
})

/**
 * Exposes the project's text styles as CSS variables, so markup that isn't a text block
 * (captions, the cover's meta line) can follow them.
 */
export const typographyStyle = (typography: Typography): CSSProperties =>
  ({
    '--font-heading': getFont(typography.heading.font).family,
    '--font-body': getFont(typography.body.font).family,
    '--type-scale': typography.body.fontSize / BASE_FONT_SIZE,
    fontFamily: 'var(--font-body)',
  }) as CSSProperties
