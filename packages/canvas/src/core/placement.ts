import { z } from 'zod'

/**
 * `flow` nodes stack in the parent's `children` order. `absolute` nodes sit on top of the
 * parent box at coordinates stored as fractions of that box, so a viewport resize keeps them
 * in place. Only containers whose definition opts in accept `absolute` children.
 */
export const flowPlacementSchema = z.object({ mode: z.literal('flow') })

export const absolutePlacementSchema = z.object({
  mode: z.literal('absolute'),
  /** Left edge, 0..1 of the parent width. */
  x: z.number(),
  /** Top edge, 0..1 of the parent height. */
  y: z.number(),
  /** Width, 0..1 of the parent width. Height is derived from content. */
  width: z.number().positive(),
  /** Degrees, clockwise. */
  rotation: z.number().default(0),
  /** Stacking order among absolute siblings. */
  z: z.number().int().default(0),
})

export const placementSchema = z.discriminatedUnion('mode', [
  flowPlacementSchema,
  absolutePlacementSchema,
])

export type FlowPlacement = z.infer<typeof flowPlacementSchema>
export type AbsolutePlacement = z.infer<typeof absolutePlacementSchema>
export type Placement = z.infer<typeof placementSchema>
export type PlacementMode = Placement['mode']

export const FLOW: FlowPlacement = { mode: 'flow' }

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))
