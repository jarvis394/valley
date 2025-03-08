import { CSSProperties } from 'react'

type GridUnitProperties = 'gap' | 'padding'
type GridUnitValue<T extends keyof CSSProperties> = T extends GridUnitProperties
  ? number | number[]
  : CSSProperties[T]

export type ViewportSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type ViewportCSSProperties<
  T extends keyof CSSProperties,
  SupportedViewportSizes extends ViewportSize = ViewportSize
> = Partial<Record<SupportedViewportSizes, GridUnitValue<T>>>

export type CSSProp<
  T extends keyof CSSProperties,
  SupportedViewportSizes extends ViewportSize = ViewportSize
> = ViewportCSSProperties<T, SupportedViewportSizes> | GridUnitValue<T>
