import { Minus, UnfoldVertical, WrapText } from 'lucide-react'
import { z } from 'zod'
import { FLOW } from '../../core/placement'
import { textStyleSchema, TEXT_ROLES } from '../../core/theme'
import { useSlotSpec, useTheme } from '../../render/context'
import { defineBlock, type BlockInspectorProps, type BlockRenderProps } from '../../registry/types'
import { InlineText, toSingleLine } from '../shared/inline-text'
import { textAlignSchema } from '../shared/text-align'
import { TextRoleMenu, TextStyleFields } from '../shared/text-style-controls'
import { textStyleCss } from '../shared/theme'
import {
  cn,
  ColorField,
  Field,
  IconButton,
  NumberField,
  PlusIcon,
  Section,
  Segmented,
  TextField,
  TextFormatIcon,
} from '@valley/ui'

const MAX_PADDING = 240
const MAX_LINES = 20
const DEFAULT_COLOR = '#ffffff'

const PADDING_PRESETS = [
  { label: 'None', value: 0 },
  { label: 'Small', value: 8 },
  { label: 'Medium', value: 40 },
  { label: 'Large', value: 80 },
] as const

/** v1 stored padding as a name; these are the pixels its classes drew. */
const PADDING_BY_NAME: Record<string, number> = { none: 0, small: 8, medium: 40, large: 80 }

const textSchema = z.object({
  value: z.string(),
  /** The project style this text follows. */
  role: z.enum(TEXT_ROLES),
  /** Fields this text sets itself instead of taking them from its role. */
  style: textStyleSchema.partial(),
  align: textAlignSchema,
  /** Space above and below the text, in pixels. */
  padding: z.number().int().min(0).max(MAX_PADDING),
  /** Ends the text with an ellipsis after `maxLines` lines. */
  truncate: z.boolean(),
  maxLines: z.number().int().min(1).max(MAX_LINES),
  /** `#rrggbb`; null takes the color of whatever holds the text. */
  color: z
    .string()
    .regex(/^#[0-9a-f]{6}$/)
    .nullable(),
  width: z.enum(['narrow', 'wide', 'full']),
})

export type TextProps = z.infer<typeof textSchema>

declare module '../../core/document' {
  interface BlockPropsMap {
    text: TextProps
  }
}

const WIDTH = { narrow: 'max-w-2xl', wide: 'max-w-200', full: 'max-w-none' } as const
const ALIGN = { left: 'text-left', center: 'text-center', right: 'text-right' } as const

function useTextStyle(props: TextProps) {
  const theme = useTheme()

  return { ...theme.typography[props.role], ...props.style }
}

/**
 * On the page a text lays itself out (padding, width, alignment). In a slot its parent
 * does, and the text only draws its type.
 */
function TextRender({ node, props, update, mode }: BlockRenderProps<'text'>) {
  const style = useTextStyle(props)
  const inSlot = !!node.slot
  const noLineBreaks = useSlotSpec(node)?.noLineBreaks

  const text = (
    <InlineText
      as={props.role === 'heading' ? 'h2' : 'p'}
      value={noLineBreaks ? toSingleLine(props.value) : props.value}
      editable={mode === 'edit'}
      noLineBreaks={noLineBreaks}
      maxLines={props.truncate ? props.maxLines : undefined}
      placeholder={node.name ?? 'Start typing…'}
      onChange={(value) => update((d) => void (d.value = value), { mergeKey: 'text.value' })}
      className={cn(
        'text-pretty',
        !inSlot && ['mx-auto', WIDTH[props.width], ALIGN[props.align]],
        !inSlot && props.role === 'body' && 'opacity-63',
      )}
      style={{ ...textStyleCss(style), color: props.color ?? undefined }}
    />
  )

  return inSlot ? (
    text
  ) : (
    <div className="px-4" style={{ paddingBlock: props.padding }}>
      {text}
    </div>
  )
}

function TextInspector({ node, props, update }: BlockInspectorProps<'text'>) {
  const style = useTextStyle(props)
  const inSlot = !!node.slot
  const noLineBreaks = useSlotSpec(node)?.noLineBreaks

  return (
    <>
      <Section title="Text">
        <TextField
          multiline={!noLineBreaks}
          value={noLineBreaks ? toSingleLine(props.value) : props.value}
          onChange={(value) => update((d) => void (d.value = value), { mergeKey: 'text.value' })}
        />
        <div className="grid grid-cols-2 gap-2">
          <Field label="Truncate text">
            <Segmented
              aria-label="Truncate text"
              value={props.truncate ? 'ellipsis' : 'none'}
              onChange={(mode) => update((d) => void (d.truncate = mode === 'ellipsis'))}
              options={[
                { value: 'none', label: <Minus className="size-4" />, title: 'Off' },
                { value: 'ellipsis', label: 'A…', title: 'Ellipsis' },
              ]}
            />
          </Field>
          {props.truncate && (
            <Field label="Max lines">
              <NumberField
                label="Max lines"
                icon={<WrapText opacity={0.63} />}
                value={props.maxLines}
                min={1}
                max={MAX_LINES}
                onChange={(maxLines) =>
                  update((d) => void (d.maxLines = maxLines), { mergeKey: 'text.maxLines' })
                }
              />
            </Field>
          )}
        </div>
        {!inSlot && (
          <>
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
              <NumberField
                label="Padding"
                icon={<UnfoldVertical opacity={0.63} />}
                value={props.padding}
                min={0}
                max={MAX_PADDING}
                step={4}
                presets={PADDING_PRESETS}
                onChange={(padding) =>
                  update((d) => void (d.padding = padding), { mergeKey: 'text.padding' })
                }
              />
            </Field>
          </>
        )}
      </Section>
      <Section
        title="Typography"
        action={
          <TextRoleMenu
            value={props.role}
            onChange={(role) => update((d) => void (d.role = role))}
          />
        }
      >
        <TextStyleFields
          value={style}
          onChange={(patch, options) => update((d) => void Object.assign(d.style, patch), options)}
          align={
            inSlot
              ? undefined
              : { value: props.align, onChange: (align) => update((d) => void (d.align = align)) }
          }
        />
      </Section>
      <Section
        title="Fill"
        action={
          props.color === null && (
            <IconButton
              size="sm"
              aria-label="Add fill"
              onClick={() => update((d) => void (d.color = DEFAULT_COLOR))}
            >
              <PlusIcon />
            </IconButton>
          )
        }
      >
        {props.color !== null && (
          <ColorField
            label="Text color"
            value={props.color}
            onChange={(color) => update((d) => void (d.color = color), { mergeKey: 'text.color' })}
            end={
              <IconButton
                size="sm"
                aria-label="Remove fill"
                onClick={() => update((d) => void (d.color = null))}
              >
                <Minus className="size-4" />
              </IconButton>
            }
          />
        )}
      </Section>
    </>
  )
}

export const textBlock = defineBlock({
  type: 'text',
  label: 'Text',
  icon: TextFormatIcon,
  title: (props) => props.value.trim().split('\n')[0]!,
  version: 7,
  schema: textSchema,
  // v2 made padding pixels; v3 added the role and style fields; v4 to v6 the line limit; v7 the color.
  migrate: (props, fromVersion) => {
    const { padding, maxLines, truncate, ...rest } = props as {
      padding?: unknown
      maxLines?: number | null
      truncate?: boolean
    }

    return {
      role: 'body',
      style: {},
      color: null,
      ...rest,
      padding: fromVersion < 2 && typeof padding === 'string' ? PADDING_BY_NAME[padding] : padding,
      truncate: !!maxLines && truncate !== false,
      maxLines: maxLines ?? 1,
    }
  },
  create: () => ({
    value: '',
    role: 'body',
    style: {},
    align: 'center',
    padding: 40,
    truncate: false,
    maxLines: 1,
    color: null,
    width: 'wide',
  }),
  placement: { allowed: ['flow'], initial: () => FLOW },
  Render: TextRender,
  Inspector: TextInspector,
})
