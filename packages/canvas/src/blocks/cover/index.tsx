import { Trash2 } from 'lucide-react'
import { z } from 'zod'
import { formatLongDate } from '../../core/format'
import { assetIdSchema } from '../../core/ids'
import { FLOW } from '../../core/placement'
import { useAsset, useMeta } from '../../render/context'
import { defineBlock, type BlockInspectorProps, type BlockRenderProps } from '../../registry/types'
import { AssetPicker, CENTER, FocalPointPicker, focalPointSchema, Media } from '../shared/media'
import { textAlignSchema, TextAlignControl } from '../shared/text-align'
import { typographyStyle, useResolvedTheme } from '../shared/theme'
import { COVER_VARIANT_IDS, COVER_VARIANTS, type CoverVariant } from './variants'
import { cn, Field, IconButton, Section, SwitchField, TilePicker, ToolbarIcon } from '@valley/ui'

const coverSchema = z.object({
  assetId: assetIdSchema.nullable(),
  focalPoint: focalPointSchema,
  variant: z.enum(COVER_VARIANT_IDS),
  align: textAlignSchema,
  showMeta: z.boolean(),
})

export type CoverProps = z.infer<typeof coverSchema>

declare module '../../core/document' {
  interface BlockPropsMap {
    cover: CoverProps
  }
}

const META_ALIGN = {
  left: 'items-start @xs:justify-start',
  center: 'items-center @xs:justify-center',
  right: 'items-end @xs:justify-end',
} as const

const fromProps = (from: unknown) => (from ?? {}) as { title?: unknown; subtitle?: unknown }

function CoverRender({ node, props, mode, slots }: BlockRenderProps<'cover'>) {
  const asset = useAsset(props.assetId)
  const project = useMeta()
  const theme = useResolvedTheme(node.overrides)
  const { Layout, title: titleLook } = COVER_VARIANTS[props.variant] as CoverVariant

  // The layout sizes the card; text longer than its room is cut off rather than growing it.
  const text = (
    <div className="flex min-h-0 w-full flex-col overflow-hidden">
      {slots?.title && (
        <div className={cn('w-full min-w-0', titleLook?.className)} style={titleLook?.style}>
          {slots.title}
        </div>
      )}
      {slots?.subtitle && <div className="mt-3 w-full min-w-0 opacity-80">{slots.subtitle}</div>}
    </div>
  )

  // Avatar beside the author; the date shares their row when it fits and goes below when
  // the text column is narrow (split cards, phones).
  const metaLine = props.showMeta && (
    <div className="@container w-full">
      <p
        className={cn(
          'flex flex-col gap-1 font-light whitespace-nowrap @xs:flex-row @xs:items-center @xs:gap-3',
          META_ALIGN[props.align],
        )}
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'calc(var(--type-scale) * .9375rem)',
        }}
      >
        <span className="flex max-w-full min-w-0 items-center gap-3">
          {project.authorAvatar && (
            <img
              src={project.authorAvatar}
              alt=""
              className="size-7 shrink-0 rounded-md border-[0.5px] border-white/7 object-cover"
            />
          )}
          <span className="truncate">{project.author}</span>
        </span>
        <span className="hidden size-1 shrink-0 rounded-full bg-white/12 @xs:block" />
        <time dateTime={project.date} className="max-w-full truncate">
          {formatLongDate(project.date)}
        </time>
      </p>
    </div>
  )

  return (
    <div style={typographyStyle(theme.typography)}>
      <Layout
        align={props.align}
        mode={mode}
        text={text}
        meta={metaLine}
        media={<Media asset={asset} focalPoint={props.focalPoint} className="size-full" />}
      />
    </div>
  )
}

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
            className="flex-1"
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
              size="lg"
              variant="danger"
              aria-label="Remove image"
              onClick={() => update((d) => void (d.assetId = null))}
            >
              <Trash2 className="size-4" />
            </IconButton>
          )}
        </div>
        <TextAlignControl
          value={props.align}
          onChange={(align) => update((d) => void (d.align = align))}
        />
      </Section>
      <Section title="Content">
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
  // v2 moved the title and subtitle into slot children; `fillSlots` hands them over.
  version: 2,
  migrate: (props) => props,
  schema: coverSchema,
  container: {
    layout: 'slots',
    slots: [
      {
        name: 'title',
        label: 'Title',
        type: 'text',
        noLineBreaks: true,
        create: ({ doc, from }) => {
          const { title } = fromProps(from)

          return {
            value: typeof title === 'string' ? title : doc.meta.title,
            role: 'heading',
            style: { fontSize: 40, lineHeight: 1.05, letterSpacing: -0.02 },
            align: 'left',
            padding: 0,
            truncate: false,
            maxLines: 1,
            color: null,
            width: 'full',
          }
        },
      },
      {
        name: 'subtitle',
        label: 'Subtitle',
        type: 'text',
        noLineBreaks: true,
        create: ({ from }) => {
          const { subtitle } = fromProps(from)

          return {
            value: typeof subtitle === 'string' ? subtitle : '',
            role: 'body',
            style: { fontSize: 17 },
            align: 'left',
            padding: 0,
            truncate: false,
            maxLines: 1,
            color: null,
            width: 'full',
          }
        },
        hidden: ({ from }) => !fromProps(from).subtitle,
      },
    ],
  },
  create: ({ doc }) => ({
    assetId: Object.values(doc.assets).find((a) => a.kind === 'image')?.id ?? null,
    focalPoint: CENTER,
    variant: 'split',
    align: 'center',
    showMeta: true,
  }),
  placement: { allowed: ['flow'], initial: () => FLOW },
  coverAsset: (props) => props.assetId,
  setCoverAsset: (props, assetId) => {
    props.assetId = assetId
    props.focalPoint = CENTER
  },
  Render: CoverRender,
  Inspector: CoverInspector,
})
