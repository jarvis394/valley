import { describe } from 'bun:test'

import { createOxlintRuleHarness } from '../test/utils.ts'

const rule = createOxlintRuleHarness('valley/require-centered-scroll-gutter', {
  filename: 'fixture.tsx',
})

describe('valley/require-centered-scroll-gutter', () => {
  rule.valid(
    'allows a scroller that does not center',
    `const el = <div className="overflow-y-auto p-4" />;`,
  )

  rule.valid(
    'allows a centering scroller with a stable gutter',
    `const el = <div className="flex flex-col items-center overflow-y-auto [scrollbar-gutter:stable_both-edges]" />;`,
  )

  rule.valid(
    'allows a centering scroller with a hidden scrollbar',
    `const el = <div className="flex justify-center overflow-y-auto [scrollbar-width:none]" />;`,
  )

  rule.valid(
    'allows a centered block outside a scroller',
    `const el = <div className="mx-auto max-w-lg" />;`,
  )

  rule.invalid(
    'reports a column scroller that centers items',
    `const el = <div className="flex flex-col items-center overflow-y-auto" />;`,
  )

  rule.invalid(
    'reports a row scroller that centers justified content',
    `const el = <div className="flex justify-center overflow-auto" />;`,
  )

  rule.invalid(
    'reports a scroller whose child is centered by margin',
    `const el = <div className="overflow-y-auto"><div className="mx-auto max-w-lg" /></div>;`,
  )

  rule.invalid(
    'reports a gutter that only applies at one breakpoint',
    `const el = <div className="flex justify-center overflow-auto lg:scrollbar-gutter-both" />;`,
  )
})
