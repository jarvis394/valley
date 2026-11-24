import { flushSync } from 'react-dom'

/** Runs a state update inside a view transition so named auth parts morph to their new place. */
export function withViewTransition(update: () => void) {
  if (!document.startViewTransition) {
    update()

    return
  }

  document.startViewTransition(() => flushSync(update))
}
