import { z } from 'zod'
import { assetIdSchema } from '../../core/ids'
import { FLOW } from '../../core/placement'
import { useAsset } from '../../render/context'
import { defineBlock, type BlockInspectorProps, type BlockRenderProps } from '../../registry/types'
import { InlineText } from '../shared/inline-text'
import { AssetPicker, CENTER, FocalPointPicker, focalPointSchema, Media } from '../shared/media'
import { cn, Field, Section, Segmented, KvIcon } from '@valley/ui'

const sceneSchema = z.object({
  assetId: assetIdSchema.nullable(),
  focalPoint: focalPointSchema,
  height: z.enum(['natural', 'screen']),
  fit: z.enum(['cover', 'contain']),
  caption: z.string(),
})
export type SceneProps = z.infer<typeof sceneSchema>

declare module '../../core/document' {
  interface BlockPropsMap {
    scene: SceneProps
  }
}

function SceneRender({ props, update, mode }: BlockRenderProps<'scene'>) {
  const asset = useAsset(props.assetId)
  return (
    <figure className="bg-black">
      <div
        className={cn('w-full', props.height === 'screen' ? 'h-svh' : 'max-h-svh')}
        style={
          props.height === 'natural' && asset
            ? { aspectRatio: `${asset.width} / ${asset.height}` }
            : { minHeight: '20rem' }
        }
      >
        <Media asset={asset} focalPoint={props.focalPoint} fit={props.fit} className="size-full" />
      </div>
      {(props.caption || mode === 'edit') && (
        <InlineText
          as="p"
          value={props.caption}
          editable={mode === 'edit'}
          placeholder="Add a caption"
          onChange={(caption) =>
            update((d) => void (d.caption = caption), { mergeKey: 'scene.caption' })
          }
          className="px-6 py-3 text-center text-sm text-neutral-400"
        />
      )}
    </figure>
  )
}

function SceneInspector({ props, update }: BlockInspectorProps<'scene'>) {
  const asset = useAsset(props.assetId)
  return (
    <Section title="Scene">
      {asset?.kind === 'image' && (
        <FocalPointPicker
          asset={asset}
          value={props.focalPoint}
          onChange={(focalPoint) =>
            update((d) => void (d.focalPoint = focalPoint), { mergeKey: 'scene.focal' })
          }
        />
      )}
      <AssetPicker
        value={props.assetId}
        label={asset ? 'Replace file' : 'Choose photo or video'}
        onChange={(assetId) =>
          update((d) => {
            d.assetId = assetId
            d.focalPoint = CENTER
          })
        }
      />
      <Field label="Height">
        <Segmented
          value={props.height}
          onChange={(height) => update((d) => void (d.height = height))}
          options={[
            { value: 'natural', label: 'Natural' },
            { value: 'screen', label: 'Full screen' },
          ]}
        />
      </Field>
      <Field label="Fit">
        <Segmented
          value={props.fit}
          onChange={(fit) => update((d) => void (d.fit = fit))}
          options={[
            { value: 'cover', label: 'Fill' },
            { value: 'contain', label: 'Fit' },
          ]}
        />
      </Field>
    </Section>
  )
}

export const sceneBlock = defineBlock({
  type: 'scene',
  label: 'Scene',
  icon: KvIcon,
  version: 1,
  schema: sceneSchema,
  create: ({ doc }) => ({
    assetId:
      (Object.values(doc.assets).find((a) => a.kind === 'video') ?? Object.values(doc.assets)[0])
        ?.id ?? null,
    focalPoint: CENTER,
    height: 'natural',
    fit: 'cover',
    caption: '',
  }),
  placement: { allowed: ['flow'], initial: () => FLOW },
  Render: SceneRender,
  Inspector: SceneInspector,
})
