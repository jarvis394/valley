import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { cn } from '@valley/ui'

/** Folds line breaks (and the space around them) into single spaces. */
export const toSingleLine = (value: string) => value.replace(/\s*\n\s*/g, ' ')

/**
 * Plain-text inline editing via `contentEditable="plaintext-only"`.
 * The DOM is uncontrolled while focused, so the caret never jumps. External changes
 * (undo/redo, inspector edits) get written into the DOM when they differ.
 */
export function InlineText({
  value,
  onChange,
  editable,
  placeholder,
  className,
  style,
  as: Tag = 'div',
  noLineBreaks,
  maxLines,
}: {
  value: string
  onChange: (value: string) => void
  editable: boolean
  placeholder?: string
  className?: string
  style?: CSSProperties
  as?: 'div' | 'h1' | 'h2' | 'p' | 'span'
  /** Enter does nothing and pasted line breaks become spaces. */
  noLineBreaks?: boolean
  /** Lines shown before an ellipsis, even while editing. */
  maxLines?: number
}) {
  const ref = useRef<HTMLElement>(null)
  // Rendered once as children (SSR-friendly); React never updates it afterwards.
  const [initial] = useState(value)

  // oxlint-disable-next-line valley/no-unreasoned-state-sync -- writes external value changes into the uncontrolled DOM node
  useLayoutEffect(() => {
    const element = ref.current
    if (element && element.innerText !== value) element.innerText = value
  }, [value])

  const lines = cn('whitespace-pre-wrap', maxLines && 'line-clamp-(--max-lines)')
  const clampedStyle = maxLines ? { ...style, '--max-lines': maxLines } : style

  if (!editable) {
    return (
      <Tag className={cn(lines, className)} style={clampedStyle as CSSProperties}>
        {value}
      </Tag>
    )
  }

  return (
    <Tag
      ref={ref as never}
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      spellCheck
      data-placeholder={placeholder}
      onKeyDown={(event) => noLineBreaks && event.key === 'Enter' && event.preventDefault()}
      onInput={(event) => {
        const element = event.currentTarget
        if (noLineBreaks && element.innerText.includes('\n')) {
          element.innerText = toSingleLine(element.innerText)
        }
        onChange(element.innerText)
      }}
      className={cn(
        lines,
        'cursor-text outline-none empty:before:text-current/40 empty:before:content-[attr(data-placeholder)]',
        className,
      )}
      style={clampedStyle as CSSProperties}
    >
      {initial}
    </Tag>
  )
}
