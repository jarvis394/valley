import { describe, expect } from 'bun:test'

import { createOxlintRuleHarness } from '../test/utils.ts'

const reports = (output: string) => output.match(/valley\(no-unreasoned-state-sync\)/g)?.length ?? 0

const lint = (filename: string) =>
  createOxlintRuleHarness('valley/no-unreasoned-state-sync', { filename })

const component = lint('apps/web/src/Panel.tsx')

describe('valley/no-unreasoned-state-sync', () => {
  component.invalid(
    'reports every effect hook, including member calls',
    `import React, { useEffect } from "react";
export function Panel() {
  useEffect(() => {}, []);
  React.useLayoutEffect(() => {});
  React.useInsertionEffect(() => {});
  return null;
}
`,
    (output) => expect(reports(output)).toBe(3),
  )

  component.valid(
    'ignores comments, strings and lookalike names',
    `// useEffect(() => {}) in a comment
/* React.useLayoutEffect(() => {}) */
const label = "useEffect(() => {})";
const pipeline = Effect.matchCauseEffect(effect, {});
const alias = useEffect;
`,
  )

  component.valid(
    'accepts an effect whose suppression states its reason',
    `export function Panel() {
  // oxlint-disable-next-line valley/no-unreasoned-state-sync -- subscribes to the window's resize events
  React.useEffect(() => {});
  return null;
}
`,
  )

  for (const filename of [
    'apps/web/src/Panel.test.tsx',
    'apps/web/src/Panel.spec.tsx',
    'apps/web/tests/Panel.tsx',
  ]) {
    lint(filename).valid(
      `skips ${filename}`,
      `export function Panel() { useEffect(() => {}); return null; }`,
    )
  }
})
