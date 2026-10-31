import { Sticker } from 'lucide-react'
import { z } from 'zod'
import { defineBlock, type BlockInspectorProps, type BlockRenderProps } from '../../registry/types'
import { ColorField, Field, Section, Segmented, TextField } from '@valley/ui'

/**
 * Experimental `absolute` block that tests free placement, rotation and z-order.
 * Size and rotation live in `placement`, which the generic placement inspector edits.
 */
const stickerSchema = z.object({
  content: z.string(),
  style: z.enum(['emoji', 'label']),
  color: z.string(),
})
export type StickerProps = z.infer<typeof stickerSchema>

declare module '../../core/document' {
  interface BlockPropsMap {
    sticker: StickerProps
  }
}

function StickerRender({ props }: BlockRenderProps<'sticker'>) {
  if (props.style === 'emoji') {
    return (
      <div className="@container w-full select-none">
        <div className="text-center leading-none drop-shadow-lg" style={{ fontSize: '80cqw' }}>
          {props.content}
        </div>
      </div>
    )
  }
  return (
    <div className="@container w-full select-none">
      <div
        className="rounded-full px-[0.6em] py-[0.25em] text-center font-bold whitespace-nowrap text-black shadow-lg"
        style={{ background: props.color, fontSize: '14cqw' }}
      >
        {props.content}
      </div>
    </div>
  )
}

function StickerInspector({ props, update }: BlockInspectorProps<'sticker'>) {
  return (
    <Section title="Sticker">
      <Field label="Style">
        <Segmented
          value={props.style}
          onChange={(style) => update((d) => void (d.style = style))}
          options={[
            { value: 'emoji', label: 'Emoji' },
            { value: 'label', label: 'Label' },
          ]}
        />
      </Field>
      <Field label="Content">
        <TextField
          value={props.content}
          onChange={(content) => update((d) => void (d.content = content), { mergeKey: 'sticker' })}
        />
      </Field>
      {props.style === 'label' && (
        <Field label="Color">
          <ColorField
            value={props.color}
            onChange={(color) =>
              update((d) => void (d.color = color), { mergeKey: 'sticker.color' })
            }
          />
        </Field>
      )}
    </Section>
  )
}

export const stickerBlock = defineBlock({
  type: 'sticker',
  label: 'Sticker',
  description: 'Free-floating, experimental',
  icon: Sticker,
  version: 1,
  experimental: true,
  schema: stickerSchema,
  create: () => ({ content: '✨', style: 'emoji', color: '#d9f99d' }),
  placement: {
    allowed: ['absolute'],
    initial: () => ({ mode: 'absolute', x: 0.72, y: 0.04, width: 0.1, rotation: -8, z: 1 }),
  },
  Render: StickerRender,
  Inspector: StickerInspector,
})
