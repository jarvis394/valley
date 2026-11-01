import { describe, expect } from 'bun:test'

import { createOxlintRuleHarness } from '../test/utils.ts'

const rule = createOxlintRuleHarness('valley/statement-padding', { filename: 'fixture.tsx' })

describe('valley/statement-padding', () => {
  rule.valid(
    'allows values, then helpers, then the return',
    `function Panel() {
  const a = useA()
  const b = a + 1

  const set = (v) => save(v)
  const reset = () => save(b)

  return set
}`,
  )

  rule.valid('allows a lone return', `function f() {\n  return 1\n}`)

  rule.valid(
    'allows a value that depends on a helper below it',
    `function Panel() {
  const open = () => setOpen(true)

  const props = { onClick: open }

  return props
}`,
  )

  rule.valid(
    'allows adjacent single-line top-level statements',
    `const a = 1\nconst b = () => a\nexport const c = 2`,
  )

  rule.valid(
    'allows adjacent multi-line imports',
    `import {\n  a,\n} from 'a'\nimport {\n  b,\n} from 'b'`,
  )

  rule.invalid(
    'reports a missing blank line before the return',
    `function Panel() {\n  const a = 1\n  return a\n}`,
    (output) => expect(output).toContain('blank line before the return'),
  )

  rule.invalid(
    'reports a helper glued to values',
    `function Panel() {\n  const a = 1\n  const share = () => a\n\n  return share\n}`,
    (output) => expect(output).toContain('Separate helper functions'),
  )

  rule.invalid(
    'reports a value declared after the helpers',
    `function Panel() {
  const a = 1

  const set = (v) => save(v)

  const files = useFiles()

  return set
}`,
    (output) => expect(output).toContain('Move this value above the helper functions'),
  )

  rule.invalid(
    'reports a multi-line top-level statement glued to its neighbour',
    `const options = [\n  1,\n] as const\nconst other = 2`,
    (output) => expect(output).toContain('multi-line top-level'),
  )
})
