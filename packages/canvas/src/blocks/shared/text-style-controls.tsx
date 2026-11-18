import { Check, MoveVertical, WholeWord } from 'lucide-react'
import { FONTS, getFont } from '../../core/fonts'
import {
  FONT_SIZE_PRESETS,
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
  TEXT_ROLES,
  type TextRole,
  type TextStyle,
} from '../../core/theme'
import type { UpdateOptions } from '../../registry/types'
import { TextAlignControl, type TextAlign } from './text-align'
import { IconButton, Menu, NumberField, SelectField } from '@valley/ui'

const fontOptions = FONTS.map((font) => ({ value: font.id, label: font.label }))

const WEIGHT_NAMES: Record<number, string> = {
  300: 'Light',
  400: 'Regular',
  500: 'Medium',
  600: 'Semibold',
  700: 'Bold',
  800: 'Extrabold',
}

export const ROLE_LABELS: Record<TextRole, string> = { heading: 'Heading', body: 'Body' }

const nearest = (weights: readonly number[], weight: number) =>
  weights.reduce((best, w) => (Math.abs(w - weight) < Math.abs(best - weight) ? w : best))

/**
 * The one editor for a text style: font, weight, size, line height, letter spacing and,
 * when `align` is given, alignment. Project styles and every text block use it.
 */
export function TextStyleFields({
  value,
  onChange,
  align,
}: {
  value: TextStyle
  onChange: (patch: Partial<TextStyle>, options?: UpdateOptions) => void
  align?: { value: TextAlign; onChange: (value: TextAlign) => void }
}) {
  const font = getFont(value.font)
  const weights = font.weights.includes(value.weight)
    ? font.weights
    : [...font.weights, value.weight]

  return (
    <>
      <SelectField
        value={value.font}
        options={fontOptions}
        onChange={(id) =>
          onChange({ font: id, weight: nearest(getFont(id).weights, value.weight) })
        }
        renderItem={(o) => <span style={{ fontFamily: getFont(o.value).family }}>{o.label}</span>}
      />
      <div className="grid grid-cols-2 gap-2">
        <SelectField
          value={String(value.weight)}
          options={weights.map((w) => ({ value: String(w), label: WEIGHT_NAMES[w] ?? String(w) }))}
          onChange={(weight) => onChange({ weight: Number(weight) })}
          renderItem={(o) => (
            <span style={{ fontFamily: font.family, fontWeight: Number(o.value) }}>{o.label}</span>
          )}
        />
        <NumberField
          label="Font size"
          value={value.fontSize}
          min={MIN_FONT_SIZE}
          max={MAX_FONT_SIZE}
          presets={FONT_SIZE_PRESETS}
          onChange={(fontSize) => onChange({ fontSize }, { mergeKey: 'text.fontSize' })}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <NumberField
          label="Line height"
          icon={<MoveVertical opacity={0.63} />}
          value={value.lineHeight}
          placeholder="Auto"
          min={0.5}
          max={3}
          step={0.05}
          format={{ style: 'percent' }}
          onChange={(lineHeight) => onChange({ lineHeight }, { mergeKey: 'text.lineHeight' })}
          onClear={() => onChange({ lineHeight: null })}
        />
        <NumberField
          label="Letter spacing"
          icon={<WholeWord opacity={0.63} />}
          value={value.letterSpacing}
          min={-0.2}
          max={0.5}
          step={0.005}
          format={{ style: 'percent', maximumFractionDigits: 1 }}
          onChange={(letterSpacing) =>
            onChange({ letterSpacing }, { mergeKey: 'text.letterSpacing' })
          }
        />
      </div>
      {align && <TextAlignControl value={align.value} onChange={align.onChange} />}
    </>
  )
}

function StylesIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" className="size-4" aria-hidden>
      <circle cx="4.5" cy="4.5" r="2.25" />
      <circle cx="11.5" cy="4.5" r="2.25" />
      <circle cx="4.5" cy="11.5" r="2.25" />
      <circle cx="11.5" cy="11.5" r="2.25" />
    </svg>
  )
}

/** Header action that picks which project style a text follows. */
export function TextRoleMenu({
  value,
  onChange,
}: {
  value: TextRole
  onChange: (role: TextRole) => void
}) {
  return (
    <Menu.Root>
      <Menu.Trigger render={<IconButton size="sm" aria-label="Text style" />}>
        <StylesIcon />
      </Menu.Trigger>
      <Menu.Popup align="end" className="min-w-44">
        {TEXT_ROLES.map((role) => (
          <Menu.Item
            key={role}
            icon={role === value ? <Check className="size-3.5" /> : <span />}
            onClick={() => onChange(role)}
          >
            {ROLE_LABELS[role]} style
          </Menu.Item>
        ))}
      </Menu.Popup>
    </Menu.Root>
  )
}
