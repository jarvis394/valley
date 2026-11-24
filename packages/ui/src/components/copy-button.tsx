import { Check } from 'lucide-react'
import { type ComponentProps, useRef, useState } from 'react'
import { CopyIcon } from '../icons'
import { IconButton } from './button'

const RESET_MS = 1500

/** Copies text to the clipboard and reports `copied` for a moment afterwards. */
export function useCopy() {
  const [copied, setCopied] = useState(false)
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const copy = async (text: string) => {
    await navigator.clipboard?.writeText(text)
    setCopied(true)
    clearTimeout(resetTimer.current)
    resetTimer.current = setTimeout(() => setCopied(false), RESET_MS)
  }

  return { copied, copy }
}

/** Icon button that copies `value` and shows a check while `data-copied` is set. */
export function CopyButton({
  value,
  label = 'Copy',
  copiedLabel = 'Copied',
  ...props
}: Omit<ComponentProps<typeof IconButton>, 'value' | 'onClick' | 'children'> & {
  value: string
  label?: string
  copiedLabel?: string
}) {
  const { copied, copy } = useCopy()

  return (
    <IconButton
      {...props}
      aria-label={copied ? copiedLabel : label}
      data-copied={copied || undefined}
      onClick={() => void copy(value)}
    >
      {copied ? <Check className="size-4" /> : <CopyIcon />}
    </IconButton>
  )
}
