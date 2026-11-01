import { describe, expect } from 'bun:test'

import { createOxlintRuleHarness } from '../test/utils.ts'

const rule = createOxlintRuleHarness('valley/tailwind-scale', { filename: 'fixture.tsx' })

describe('valley/tailwind-scale', () => {
  rule.valid('allows spacing steps', `const a = <div className="h-13 -top-0.75 lg:pt-45" />`)

  rule.valid('allows type styles', `const a = <p className="text-small text-fg/63" />`)

  rule.valid(
    'allows arbitrary values off the spacing scale',
    `const a = "border-[0.5px] rounded-[10px] max-w-[16ch] text-[0.85em]"`,
  )

  rule.valid('allows text colors', `const a = "text-white text-[#ededed]"`)

  rule.invalid(
    'reports arbitrary px heights',
    `const a = <div className="flex h-[52px]" />`,
    (output) => expect(output).toContain('Use h-13 instead of h-[52px]'),
  )

  rule.invalid('keeps the negative sign and variant', `const a = "lg:-top-[3px]"`, (output) =>
    expect(output).toContain('Use -top-0.75 instead of -top-[3px]'),
  )

  rule.invalid('reports arbitrary px in templates', 'const a = `py-[5px] ${b}`', (output) =>
    expect(output).toContain('py-1.25'),
  )

  rule.invalid('reports arbitrary font sizes', `const a = "text-[13px] leading-5"`, (output) =>
    expect(output).toContain('type style'),
  )

  rule.invalid('reports Tailwind default font sizes', `const a = "text-xl font-medium"`)
})
