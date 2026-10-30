import { describe } from 'bun:test'

import { createOxlintRuleHarness } from '../test/utils.ts'

const rule = createOxlintRuleHarness('valley/no-raw-resize-observer', { filename: 'fixture.ts' })

describe('valley/no-raw-resize-observer', () => {
  rule.valid('allows observeResize', `const stop = observeResize(element, () => {});`)

  rule.valid('allows other observers', `const observer = new IntersectionObserver(() => {});`)

  rule.invalid('reports new ResizeObserver', `const observer = new ResizeObserver(() => {});`)

  rule.invalid(
    'reports window.ResizeObserver',
    `const observer = new window.ResizeObserver(() => {});`,
  )

  rule.invalid(
    'reports globalThis["ResizeObserver"]',
    `const observer = new globalThis["ResizeObserver"](() => {});`,
  )
})
