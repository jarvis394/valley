import { expect, test } from 'bun:test'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

const oxlintBin = join(
  dirname(createRequire(import.meta.url).resolve('oxlint/package.json')),
  'bin',
  'oxlint',
)
const pluginPath = join(import.meta.dirname, '..', 'index.ts')
const repoRoot = join(import.meta.dirname, '..', '..')

interface RuleHarnessOptions {
  readonly filename?: string
  readonly ruleOptions?: ReadonlyArray<unknown>
}

function lint(ruleName: string, source: string, options: RuleHarnessOptions) {
  const fixtureDir = mkdtempSync(join(tmpdir(), 'valley-oxlint-'))
  try {
    const configPath = join(fixtureDir, '.oxlintrc.json')
    const sourcePath = join(fixtureDir, options.filename ?? 'fixture.ts')
    writeFileSync(
      configPath,
      JSON.stringify({
        jsPlugins: [{ name: 'valley', specifier: pluginPath }],
        rules: { [ruleName]: ['error', ...(options.ruleOptions ?? [])] },
      }),
    )
    mkdirSync(dirname(sourcePath), { recursive: true })
    writeFileSync(sourcePath, source)
    const result = spawnSync('node', [oxlintBin, '--config', configPath, sourcePath], {
      cwd: repoRoot,
      encoding: 'utf8',
    })
    return { exitCode: result.status, output: `${result.stdout}${result.stderr}` }
  } finally {
    rmSync(fixtureDir, { recursive: true, force: true })
  }
}

export function createOxlintRuleHarness(ruleName: string, options: RuleHarnessOptions = {}) {
  const [pluginName, shortRuleName] = ruleName.split('/')
  const diagnosticRuleName = `${pluginName}(${shortRuleName})`

  return {
    valid(name: string, source: string) {
      test(`${name} passes`, () => {
        const { exitCode, output } = lint(ruleName, source, options)
        expect(output).not.toContain(diagnosticRuleName)
        expect(exitCode).toBe(0)
      })
    },
    invalid(name: string, source: string, assertion?: (output: string) => void) {
      test(`${name} reports the rule diagnostic`, () => {
        const { exitCode, output } = lint(ruleName, source, options)
        expect(exitCode).not.toBe(0)
        expect(output).toContain(diagnosticRuleName)
        assertion?.(output)
      })
    },
  }
}
