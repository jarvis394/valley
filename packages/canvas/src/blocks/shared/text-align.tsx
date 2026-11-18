import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react'
import { z } from 'zod'
import { Segmented } from '@valley/ui'

export const textAlignSchema = z.enum(['left', 'center', 'right'])
export type TextAlign = z.infer<typeof textAlignSchema>

const options = [
  { value: 'left', label: <AlignLeft className="size-4" />, title: 'Align left' },
  { value: 'center', label: <AlignCenter className="size-4" />, title: 'Align center' },
  { value: 'right', label: <AlignRight className="size-4" />, title: 'Align right' },
] as const

export function TextAlignControl({
  value,
  onChange,
}: {
  value: TextAlign
  onChange: (value: TextAlign) => void
}) {
  return (
    <Segmented aria-label="Text alignment" value={value} options={options} onChange={onChange} />
  )
}
