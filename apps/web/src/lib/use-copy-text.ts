import { useRef, useState } from 'react'

const RESET_MS = 1500

/** Copies text to the clipboard and reports `copied` for a moment afterwards. */
export function useCopyText() {
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
