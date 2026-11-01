import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react'
import { z } from 'zod'
import { FLOW } from '../../core/placement'
import { sizeScaleSchema } from '../../core/theme'
import { defineBlock, type BlockInspectorProps, type BlockRenderProps } from '../../registry/types'
import { InlineText } from '../shared/inline-text'
import { typographyStyle, useResolvedTheme } from '../shared/theme'
import { cn, Field, Section, Segmented, TextField, TextFormatIcon } from '@valley/ui'

const textSchema = z.object({
  value: z.string(),
  align: z.enum(['left', 'center', 'right']),
  padding: z.enum(['none', ...sizeScaleSchema.options]),
  width: z.enum(['narrow', 'wide', 'full']),
})

export type TextProps = z.infer<typeof textSchema>

declare module '../../core/document' {
  interface BlockPropsMap {
    text: TextProps
  }
}

const PADDING = { none: 'py-0', small: 'py-2', medium: 'py-10', large: 'py-20' } as const
const WIDTH = { narrow: 'max-w-2xl', wide: 'max-w-200', full: 'max-w-none' } as const
const ALIGN = { left: 'text-left', center: 'text-center', right: 'text-right' } as const

function TextRender({ node, props, update, mode }: BlockRenderProps<'text'>) {
  const theme = useResolvedTheme(node.overrides)

  return (
    <div className={cn('px-4', PADDING[props.padding])} style={typographyStyle(theme.typography)}>
      <InlineText
        as="p"
        value={props.value}
        editable={mode === 'edit'}
        placeholder="Start typing…"
        onChange={(value) => update((d) => void (d.value = value), { mergeKey: 'text.value' })}
        className={cn(
          'mx-auto leading-[1.5] text-pretty opacity-63',
          WIDTH[props.width],
          ALIGN[props.align],
        )}
        style={{ fontSize: 'calc(var(--type-scale) * 1rem)' }}
      />
    </div>
  )
}

function TextInspector({ props, update }: BlockInspectorProps<'text'>) {
  return (
    <Section title="Text">
      <TextField
        multiline
        value={props.value}
        onChange={(value) => update((d) => void (d.value = value), { mergeKey: 'text.value' })}
      />
      <Field label="Alignment">
        <Segmented
          value={props.align}
          onChange={(align) => update((d) => void (d.align = align))}
          options={[
            { value: 'left', label: <AlignLeft className="size-4" /> },
            { value: 'center', label: <AlignCenter className="size-4" /> },
            { value: 'right', label: <AlignRight className="size-4" /> },
          ]}
        />
      </Field>
      <Field label="Width">
        <Segmented
          value={props.width}
          onChange={(width) => update((d) => void (d.width = width))}
          options={[
            { value: 'narrow', label: 'Narrow' },
            { value: 'wide', label: 'Wide' },
            { value: 'full', label: 'Full' },
          ]}
        />
      </Field>
      <Field label="Padding">
        <Segmented
          value={props.padding}
          onChange={(padding) => update((d) => void (d.padding = padding))}
          options={[
            { value: 'none', label: 'None' },
            { value: 'small', label: 'S' },
            { value: 'medium', label: 'M' },
            { value: 'large', label: 'L' },
          ]}
        />
      </Field>
    </Section>
  )
}

export const textBlock = defineBlock({
  type: 'text',
  label: 'Text',
  icon: TextFormatIcon,
  title: (props) => props.value.trim().split('\n')[0]!,
  version: 1,
  schema: textSchema,
  create: () => ({ value: '', align: 'center', padding: 'medium', width: 'wide' }),
  placement: { allowed: ['flow'], initial: () => FLOW },
  themeGroups: ['typography'],
  Render: TextRender,
  Inspector: TextInspector,
})
