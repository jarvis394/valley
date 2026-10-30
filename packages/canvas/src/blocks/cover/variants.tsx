import type { ComponentType, CSSProperties, ReactNode } from 'react'
import { cn } from '@valley/ui'

export type TextAlign = 'left' | 'center' | 'right'

export interface CoverLayoutProps {
  media: ReactNode
  /** Title and subtitle. */
  text: ReactNode
  /** Author and date line; null when hidden. */
  meta: ReactNode
  align: TextAlign
}

export interface CoverVariant {
  label: string
  /** Tiny schematic shown in the variant picker. */
  preview: ReactNode
  Layout: ComponentType<CoverLayoutProps>
  /** Replaces the default title look for this variant. */
  title?: { className: string; style: CSSProperties }
}

/** Default placement of the meta line: below the text. */
const TextStack = ({ text, meta }: Pick<CoverLayoutProps, 'text' | 'meta'>) => (
  <>
    {text}
    {meta && <div className="mt-8">{meta}</div>}
  </>
)

const alignItems: Record<TextAlign, string> = {
  left: 'items-start text-left',
  center: 'items-center text-center',
  right: 'items-end text-right',
}

const Scrim = ({ className }: { className?: string }) => (
  <div className={cn('pointer-events-none absolute inset-0', className)} />
)

const T = ({ className }: { className?: string }) => (
  <span className={cn('flex flex-col items-center leading-none', className)}>
    TEXT
    <span className="text-[6px]">⌄</span>
  </span>
)

/**
 * Cover design styles. Each variant is a layout component that places the shared
 * `media` and `text` slots. To add a style, add an entry here.
 */
export const COVER_VARIANTS = {
  center: {
    label: 'Center',
    preview: <T />,
    Layout: ({ media, text, meta, align }) => (
      <div className="relative aspect-[4/5] overflow-hidden text-white sm:aspect-video">
        <div className="absolute inset-0">{media}</div>
        <Scrim className="bg-black/35" />
        <div className={cn('relative flex h-full flex-col justify-center p-8', alignItems[align])}>
          <TextStack text={text} meta={meta} />
        </div>
      </div>
    ),
  },
  split: {
    label: 'Split',
    preview: (
      <span className="grid size-full grid-cols-2">
        <span className="border-r border-current" />
        <T />
      </span>
    ),
    Layout: ({ media, text, meta, align }) => (
      <div className="p-2">
        <div className="mx-auto grid max-w-[704px] overflow-hidden rounded-2xl bg-black text-white sm:aspect-[704/396] sm:grid-cols-2">
          <div className="aspect-[4/5] sm:aspect-auto">{media}</div>
          <div className={cn('flex flex-col justify-between gap-6 p-6', alignItems[align])}>
            <div className="h-7 max-sm:hidden" />
            <div className={cn('flex w-full flex-col', alignItems[align])}>{text}</div>
            <div className="h-7">{meta}</div>
          </div>
        </div>
      </div>
    ),
    title: {
      className: 'max-w-[10ch] leading-[normal] font-extrabold text-[#dcffd2]',
      style: {
        fontSize: 'calc(var(--type-scale) * 2rem)',
        fontVariationSettings: '"wdth" 115, "ROND" 100',
      },
    },
  },
  left: {
    label: 'Left',
    preview: <T className="self-end justify-self-start" />,
    Layout: ({ media, text, meta, align }) => (
      <div className="relative aspect-[4/5] overflow-hidden text-white sm:aspect-video">
        <div className="absolute inset-0">{media}</div>
        <Scrim className="bg-linear-to-t from-black/70 via-black/10 to-transparent" />
        <div className={cn('relative flex h-full flex-col justify-end p-8', alignItems[align])}>
          <TextStack text={text} meta={meta} />
        </div>
      </div>
    ),
  },
  album: {
    label: 'Album',
    preview: (
      <span className="flex flex-col items-center gap-0.5">
        <span className="h-3 w-6 border border-current" />
        <T />
      </span>
    ),
    Layout: ({ media, text, meta, align }) => (
      <div className={cn('flex flex-col gap-8 px-6 py-12', alignItems[align])}>
        <div className="aspect-[3/2] w-full max-w-3xl self-center overflow-hidden rounded-xl">
          {media}
        </div>
        <div className={cn('flex w-full max-w-3xl flex-col self-center', alignItems[align])}>
          <TextStack text={text} meta={meta} />
        </div>
      </div>
    ),
  },
  classic: {
    label: 'Classic',
    preview: (
      <span className="flex size-full items-start justify-center border border-current pt-0.5">
        <T />
      </span>
    ),
    Layout: ({ media, text, meta, align }) => (
      <div className="p-4 sm:p-8">
        <div className="relative aspect-[4/5] overflow-hidden text-white sm:aspect-video">
          <div className="absolute inset-0">{media}</div>
          <Scrim className="bg-black/30" />
          <div className={cn('relative flex h-full flex-col p-10', alignItems[align])}>
            <TextStack text={text} meta={meta} />
          </div>
        </div>
      </div>
    ),
  },
  line: {
    label: 'Line',
    preview: (
      <span className="flex size-full flex-col">
        <span className="border-b border-current pb-0.5 text-center">TEXT</span>
      </span>
    ),
    Layout: ({ media, text, meta, align }) => (
      <div className="flex flex-col">
        <div
          className={cn('flex flex-col border-b border-current/15 px-8 py-10', alignItems[align])}
        >
          <TextStack text={text} meta={meta} />
        </div>
        <div className="aspect-[4/3] sm:aspect-[21/9]">{media}</div>
      </div>
    ),
  },
  top: {
    label: 'Top',
    preview: (
      <span className="border border-current px-0.5">
        <T />
      </span>
    ),
    Layout: ({ media, text, meta, align }) => (
      <div className="relative aspect-[4/5] overflow-hidden text-white sm:aspect-video">
        <div className="absolute inset-0">{media}</div>
        <div className="relative flex justify-center p-8">
          <div
            className={cn(
              'flex flex-col border border-white/60 bg-black/30 px-8 py-6 backdrop-blur-sm',
              alignItems[align],
            )}
          >
            <TextStack text={text} meta={meta} />
          </div>
        </div>
      </div>
    ),
  },
  invert: {
    label: 'Invert',
    preview: (
      <span className="flex size-full flex-col justify-between">
        <T className="pt-1" />
        <span className="border-t-2 border-current" />
      </span>
    ),
    Layout: ({ media, text, meta, align }) => (
      <div className="flex flex-col bg-neutral-100 text-neutral-950">
        <div className={cn('flex flex-col px-8 py-14', alignItems[align])}>
          <TextStack text={text} meta={meta} />
        </div>
        <div className="aspect-[21/9]">{media}</div>
      </div>
    ),
  },
} satisfies Record<string, CoverVariant>

export type CoverVariantId = keyof typeof COVER_VARIANTS
export const COVER_VARIANT_IDS = Object.keys(COVER_VARIANTS) as [
  CoverVariantId,
  ...CoverVariantId[],
]
