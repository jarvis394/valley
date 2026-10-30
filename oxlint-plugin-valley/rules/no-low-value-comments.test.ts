import { describe } from 'bun:test'

import { createOxlintRuleHarness } from '../test/utils.ts'

const rule = createOxlintRuleHarness('valley/no-low-value-comments', { filename: 'fixture.ts' })

describe('valley/no-low-value-comments', () => {
  rule.valid(
    'allows a comment that states a reason',
    `// Safari drops the event without this.\nconst a = 1;`,
  )

  rule.valid(
    'allows directives',
    `// oxlint-disable-next-line no-console -- debug\nconsole.log(1);`,
  )

  rule.valid('allows a linked task marker', `// TODO https://example.com/issues/1\nconst a = 1;`)

  rule.invalid('reports a section divider', `// ---------- helpers ----------\nconst a = 1;`)

  rule.invalid('reports a test step label', `// Arrange\nconst a = 1;`)

  rule.invalid('reports an unlinked TODO', `// TODO fix this\nconst a = 1;`)

  rule.invalid('reports a bare issue number', `// Fixes #123, see the thread.\nconst a = 1;`)

  rule.invalid(
    'reports a JSDoc type',
    `/** @param {string} value the value */\nexport function f(value: string) {}`,
  )

  rule.invalid('reports commented-out code', `// const a = compute(1);\nconst b = 2;`)

  rule.invalid('reports a comment that repeats the name', `// user name\nconst userName = 'a';`)

  rule.invalid(
    'reports a comment longer than four lines',
    `// one\n// two\n// three\n// four\n// five\nconst a = 1;`,
  )
})
