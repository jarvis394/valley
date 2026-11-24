import { Field as BaseField } from '@base-ui/react/field'
import { useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from '../cn'

const VARIANTS = {
  /** Inspector fields: a small muted label, inset to line up with control text. */
  panel: {
    label: 'truncate px-2 text-caption leading-3.5 text-fg/63',
    description: 'px-2 text-caption text-pretty text-fg/63',
  },
  /** Page forms (auth, settings). */
  form: {
    label: 'text-small font-medium text-fg',
    description: 'text-small text-fg/63',
  },
} as const

const errorTextClass = 'min-h-0 overflow-hidden text-small text-danger'

/** Keeps the last message so it stays readable while the row collapses shut. */
function useLastMessage(message: string | undefined) {
  const [shown, setShown] = useState(message)
  if (message && message !== shown) setShown(message)

  return shown
}

/**
 * Collapses to nothing while empty. `gap` is the parent's flex gap in spacing steps, which a
 * negative margin cancels so a hidden error leaves no space behind.
 */
function ErrorReveal({
  open,
  gap,
  style,
  children,
}: {
  open: boolean
  gap: number
  style?: CSSProperties
  children: ReactNode
}) {
  return (
    <div
      aria-live="polite"
      style={{
        ...style,
        gridTemplateRows: open ? '1fr' : '0fr',
        marginTop: open ? 0 : `calc(var(--spacing) * ${-gap})`,
      }}
      className={cn(
        'grid transition-[grid-template-rows,margin,opacity] duration-200 ease-out motion-reduce:transition-none',
        open ? 'opacity-100' : 'opacity-0',
      )}
    >
      {children}
    </div>
  )
}

/** An error that isn't any one field's, e.g. a form's or a row's. */
export function FormError({
  message,
  gap = 0,
  style,
}: {
  message?: string
  gap?: number
  style?: CSSProperties
}) {
  const shown = useLastMessage(message)

  return (
    <ErrorReveal open={Boolean(message)} gap={gap} style={style}>
      <p className={errorTextClass}>{message ?? shown}</p>
    </ErrorReveal>
  )
}

/**
 * Label, control and help text. Inside a `form` field, `error` marks the control invalid and is
 * linked to it as its description.
 */
export function Field({
  variant = 'panel',
  label,
  labelEnd,
  description,
  error,
  style,
  className,
  children,
}: {
  variant?: keyof typeof VARIANTS
  label?: ReactNode
  /** Trailing content on the label line, e.g. a "Forgot password?" link. */
  labelEnd?: ReactNode
  description?: ReactNode
  error?: string
  style?: CSSProperties
  className?: string
  children: ReactNode
}) {
  const styles = VARIANTS[variant]
  const shownError = useLastMessage(error)
  // The label's padding fills the gap above the control, so hover holds while the pointer crosses it.
  const labelElement = label && (
    <BaseField.Label className={cn(styles.label, 'pb-1.5', !labelEnd && '-mb-1.5')}>
      {label}
    </BaseField.Label>
  )

  return (
    <BaseField.Root
      invalid={Boolean(error)}
      style={style}
      className={cn('flex min-w-0 flex-col gap-1.5', className)}
    >
      {labelEnd ? (
        <div className="-mb-1.5 flex items-start justify-between gap-2">
          {labelElement}
          {labelEnd}
        </div>
      ) : (
        labelElement
      )}
      {children}
      {description && !error && (
        <BaseField.Description className={styles.description}>{description}</BaseField.Description>
      )}
      {(variant === 'form' || shownError !== undefined) && (
        <ErrorReveal open={Boolean(error)} gap={1.5}>
          {error ? (
            <BaseField.Error match className={errorTextClass}>
              {error}
            </BaseField.Error>
          ) : (
            <p aria-hidden className={errorTextClass}>
              {shownError}
            </p>
          )}
        </ErrorReveal>
      )}
    </BaseField.Root>
  )
}

function FieldGroupRoot({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-control has-[>[data-separator]]:pb-0.5">
      {children}
    </div>
  )
}

/** The spacing it adds keeps the focus ring of the control below clear of the group's clip. */
function FieldGroupSeparator() {
  return <div data-separator className="mx-0.5 mb-0.5 border-t border-dashed border-white/7" />
}

/** Controls on one surface, e.g. a switch and the field it enables ("Use password"). */
export const FieldGroup = { Root: FieldGroupRoot, Separator: FieldGroupSeparator }
