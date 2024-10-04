import { CSSProperties, useCallback } from 'react'
import { CSSProp, ViewportSize } from '../types/ViewportSize'
import { GRID_UNIT } from '../config/theme'

/** Format special properties to get multiplied by default stack grid unit */
export function formatViewportVariableValue(
  propertyName: string,
  value: string | number
) {
  if (propertyName === 'gap' || propertyName === 'padding') {
    return Number(value) * GRID_UNIT + 'px'
  }

  return value
}

export const useViewportVariable = (componentName: string) => {
  const getViewportVariable = useCallback(
    <T extends keyof CSSProperties, S extends ViewportSize = ViewportSize>(
      property: CSSProp<T, S>,
      propertyName: string
    ): Record<string, string | number> => {
      if (typeof property === 'string' || typeof property === 'number') {
        return {
          [`--${componentName}-${propertyName}`]: formatViewportVariableValue(
            propertyName,
            property
          ),
        }
      }

      const res: Record<string, string | number> = {}

      if (
        typeof property === 'object' &&
        !Array.isArray(property) &&
        property !== null
      ) {
        Object.entries(property).forEach((entry) => {
          const [key, value] = entry as [string, string | number]
          if (value === undefined) return

          res[`--${key}-${componentName}-${propertyName}`] =
            formatViewportVariableValue(propertyName, value)
        })
      }

      return res
    },
    [componentName]
  )

  return { getViewportVariable }
}
