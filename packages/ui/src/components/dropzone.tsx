import { useRender } from '@base-ui/react/use-render'
import { useState, type ComponentProps, type DragEvent, type ReactElement } from 'react'
import { cn } from '../cn'
import { PlusIcon } from '../icons'
import { buttonType, focusRing } from './styles'

const VARIANTS = {
  /** Page-level upload target (projects page). */
  hero: {
    root: 'h-57 gap-4 rounded-[40px] border-white/7 bg-canvas/80 px-6 py-4 text-white backdrop-blur-lg',
    icon: 'size-5',
    label: 'text-heading opacity-63',
    dragging: 'scale-101 border-white/24 bg-white/5',
  },
  /** Dashed slot at the end of a list (outline). */
  inline: {
    root: 'h-35 gap-2 rounded-2xl border-dashed border-white/7 p-3 text-body font-medium text-fg/63 hover:border-white/12 hover:text-fg data-popup-open:border-white/12 data-popup-open:bg-white/3 data-popup-open:text-fg',
    icon: undefined,
    label: undefined,
    dragging: 'border-white/24 bg-white/5 text-fg',
  },
} as const

/**
 * A button that also takes dropped files. What a press does is the caller's: pass `onClick`, or
 * hand it to a trigger with `<Menu.Trigger render={<Dropzone … />} />`.
 */
export function Dropzone({
  variant = 'inline',
  label,
  onFiles,
  render,
  ...props
}: Omit<ComponentProps<'button'>, 'className' | 'children'> & {
  variant?: keyof typeof VARIANTS
  label: string
  onFiles: (files: File[]) => void
  render?: ReactElement
}) {
  const [dragging, setDragging] = useState(false)
  const styles = VARIANTS[variant]

  const onDragOver = (event: DragEvent) => {
    if (!event.dataTransfer.types.includes('Files')) return
    event.preventDefault()
    setDragging(true)
  }
  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragging(false)
    const files = [...event.dataTransfer.files]
    if (files.length > 0) onFiles(files)
  }

  return useRender({
    render,
    defaultTagName: 'button',
    props: {
      ...buttonType(render),
      ...props,
      onDragOver,
      onDragLeave: () => setDragging(false),
      onDrop,
      className: cn(
        'flex w-full flex-col items-center justify-center border select-none hover:bg-white/3 active:scale-99 disabled:opacity-40',
        focusRing,
        styles.root,
        dragging && styles.dragging,
      ),
      children: (
        <>
          <PlusIcon className={styles.icon} />
          <span className={styles.label}>{label}</span>
        </>
      ),
    },
  })
}
