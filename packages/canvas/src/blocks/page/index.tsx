import { File } from 'lucide-react'
import { z } from 'zod'
import { FLOW } from '../../core/placement'
import { defineBlock } from '../../registry/types'

const pageSchema = z.object({})
export type PageProps = z.infer<typeof pageSchema>

declare module '../../core/document' {
  interface BlockPropsMap {
    page: PageProps
  }
}

/**
 * The document root, a vertical stack. It is an ordinary container block, so nested
 * containers use the same rendering and drop code.
 */
export const pageBlock = defineBlock({
  type: 'page',
  label: 'Page',
  icon: File,
  version: 1,
  schema: pageSchema,
  create: () => ({}),
  placement: { allowed: ['flow'], initial: () => FLOW },
  container: { layout: 'stack', allowsAbsolute: true, accepts: (type) => type !== 'page' },
  insertable: false,
  Render: ({ children }) => <div className="min-h-full">{children}</div>,
})
