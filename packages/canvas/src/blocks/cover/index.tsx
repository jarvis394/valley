import { AlignCenter, AlignLeft, AlignRight, Trash2 } from 'lucide-react'
import { z } from 'zod'
import { formatLongDate } from '../../core/format'
import { assetIdSchema } from '../../core/ids'
import { FLOW } from '../../core/placement'
import { useAsset, useMeta } from '../../render/context'
import { defineBlock, type BlockInspectorProps, type BlockRenderProps } from '../../registry/types'
import { InlineText } from '../shared/inline-text'
import { AssetPicker, CENTER, FocalPointPicker, focalPointSchema, Media } from '../shared/media'
import { typographyStyle, useResolvedTheme } from '../shared/theme'
import { COVER_VARIANT_IDS, COVER_VARIANTS, type CoverVariant } from './variants'
import {
  Field,
  IconButton,
  Section,
  Segmented,
  SwitchField,
  TextField,
  TilePicker,
  ToolbarIcon,
} from '@valley/ui'

const coverSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  assetId: assetIdSchema.nullable(),
  focalPoint: focalPointSchema,
  variant: z.enum(COVER_VARIANT_IDS),
  align: z.enum(['left', 'center', 'right']),
  showMeta: z.boolean(),
})
export type CoverProps = z.infer<typeof coverSchema>

declare module '../../core/document' {
  interface BlockPropsMap {
    cover: CoverProps
  }
}

function CoverRender({ node, props, update, mode, selected }: BlockRenderProps<'cover'>) {
  const asset = useAsset(props.assetId)
  const project = useMeta()
  const theme = useResolvedTheme(node.overrides)
  const { Layout, title: titleLook } = COVER_VARIANTS[props.variant] as CoverVariant
  const editable = mode === 'edit'

  const text = (
    <>
      <InlineText
        as="h1"
        value={props.title}
        editable={editable}
        placeholder="Title"
        onChange={(title) => update((d) => void (d.title = title), { mergeKey: 'cover.title' })}
        className={
          titleLook?.className ?? 'max-w-[16ch] leading-[1.05] font-semibold tracking-tight'
        }
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'calc(var(--type-scale) * clamp(2.25rem, 5vw, 3.75rem))',
          ...titleLook?.style,
        }}
      />
      {/* Empty subtitle only gets a placeholder while the block is being edited. */}
      {(props.subtitle || (editable && selected)) && (
        <InlineText
          as="p"
          value={props.subtitle}
          editable={editable}
          placeholder="Subtitle"
          onChange={(subtitle) =>
            update((d) => void (d.subtitle = subtitle), { mergeKey: 'cover.subtitle' })
          }
          className="mt-3 max-w-prose opacity-80"
          style={{ fontSize: 'calc(var(--type-scale) * 1.05rem)' }}
        />
      )}
    </>
  )

  const metaLine = props.showMeta && (
    <p
      className="flex items-center gap-3 font-light whitespace-nowrap"
      style={{ fontFamily: 'var(--font-heading)', fontSize: 'calc(var(--type-scale) * .9375rem)' }}
    >
      {project.authorAvatar && (
        <img
          src={project.authorAvatar}
          alt=""
          className="size-7 rounded-md border-[0.5px] border-white/7 object-cover"
        />
      )}
      <span>{project.author}</span>
      <span className="size-1 rounded-full bg-white/12" />
      <time dateTime={project.date}>{formatLongDate(project.date)}</time>
    </p>
  )

  return (
    <div style={typographyStyle(theme.typography)}>
      <Layout
        align={props.align}
        text={text}
        meta={metaLine}
        media={<Media asset={asset} focalPoint={props.focalPoint} className="size-full" />}
      />
    </div>
  )
}

const alignOptions = [
  { value: 'left', label: <AlignLeft className="size-4" />, title: 'Align left' },
  { value: 'center', label: <AlignCenter className="size-4" />, title: 'Align center' },
  { value: 'right', label: <AlignRight className="size-4" />, title: 'Align right' },
] as const

const variantOptions = COVER_VARIANT_IDS.map((id) => ({
  value: id,
  label: COVER_VARIANTS[id].label,
  preview: COVER_VARIANTS[id].preview,
}))

function CoverInspector({ props, update }: BlockInspectorProps<'cover'>) {
  const asset = useAsset(props.assetId)
  return (
    <>
      <Section title="Cover Image">
        {asset ? (
          <FocalPointPicker
            asset={asset}
            value={props.focalPoint}
            onChange={(focalPoint) =>
              update((d) => void (d.focalPoint = focalPoint), { mergeKey: 'cover.focal' })
            }
          />
        ) : null}
        <div className="flex gap-2">
          <AssetPicker
            value={props.assetId}
            onChange={(assetId) =>
              update((d) => {
                d.assetId = assetId
                d.focalPoint = CENTER
              })
            }
          />
          {asset && (
            <IconButton
              variant="danger"
              aria-label="Remove image"
              onClick={() => update((d) => void (d.assetId = null))}
            >
              <Trash2 className="size-4" />
            </IconButton>
          )}
        </div>
        <Segmented
          aria-label="Text alignment"
          value={props.align}
          options={alignOptions}
          onChange={(align) => update((d) => void (d.align = align))}
        />
      </Section>
      <Section title="Content">
        <Field label="Title">
          <TextField
            value={props.title}
            onChange={(title) => update((d) => void (d.title = title), { mergeKey: 'cover.title' })}
          />
        </Field>
        <Field label="Subtitle">
          <TextField
            value={props.subtitle}
            onChange={(subtitle) =>
              update((d) => void (d.subtitle = subtitle), { mergeKey: 'cover.subtitle' })
            }
          />
        </Field>
        <SwitchField
          label="Show author and date"
          checked={props.showMeta}
          onChange={(showMeta) => update((d) => void (d.showMeta = showMeta))}
        />
      </Section>
      <Section title="Cover Style">
        <Field label="Variant">
          <TilePicker
            value={props.variant}
            options={variantOptions}
            onChange={(variant) => update((d) => void (d.variant = variant))}
          />
        </Field>
      </Section>
    </>
  )
}

export const coverBlock = defineBlock({
  type: 'cover',
  label: 'Cover',
  icon: ToolbarIcon,
  version: 1,
  schema: coverSchema,
  create: ({ doc }) => ({
    title: doc.meta.title,
    subtitle: '',
    assetId: Object.values(doc.assets).find((a) => a.kind === 'image')?.id ?? null,
    focalPoint: CENTER,
    variant: 'split',
    align: 'center',
    showMeta: true,
  }),
  placement: { allowed: ['flow'], initial: () => FLOW },
  themeGroups: ['typography'],
  coverAsset: (props) => props.assetId,
  Render: CoverRender,
  Inspector: CoverInspector,
})
