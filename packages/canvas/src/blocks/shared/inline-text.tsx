import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { cn } from '@valley/ui'

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
}: {
  value: string
  onChange: (value: string) => void
  editable: boolean
  placeholder?: string
  className?: string
  style?: CSSProperties
  as?: 'div' | 'h1' | 'h2' | 'p' | 'span'
}) {
  const ref = useRef<HTMLElement>(null)
  // Rendered once as children (SSR-friendly); React never updates it afterwards.
  const [initial] = useState(value)

  // oxlint-disable-next-line valley/no-unreasoned-state-sync -- writes external value changes into the uncontrolled DOM node
  useLayoutEffect(() => {
    const element = ref.current
    if (element && element.innerText !== value) element.innerText = value
  }, [value])

  if (!editable) {
    return (
      <Tag className={cn('whitespace-pre-wrap', className)} style={style}>
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
      onInput={(event) => onChange(event.currentTarget.innerText)}
      className={cn(
        'cursor-text whitespace-pre-wrap outline-none empty:before:text-current/40 empty:before:content-[attr(data-placeholder)]',
        className,
      )}
      style={style}
    >
      {initial}
    </Tag>
  )
}
