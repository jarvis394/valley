import { defineRule, type ESTree } from '@oxlint/plugins'

type Statement = ESTree.Statement | ESTree.Directive | ESTree.ModuleDeclaration

const BLANK_LINE = /\n[ \t]*\n/u

function unwrapExport(node: Statement): ESTree.Node {
  if (
    (node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration') &&
    node.declaration
  ) {
    return node.declaration
  }

  return node
}

function isFunctionInit(init: ESTree.Node | null | undefined): boolean {
  if (!init) return false
  if (init.type === 'TSAsExpression' || init.type === 'TSSatisfiesExpression') {
    return isFunctionInit(init.expression)
  }

  return init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression'
}

// One-declarator consts only: `const a = 1, b = () => a` has no single kind.
function soleDeclarator(node: Statement): ESTree.VariableDeclarator | null {
  const inner = unwrapExport(node)
  if (inner.type !== 'VariableDeclaration' || inner.declarations.length !== 1) return null

  return inner.declarations[0] ?? null
}

function declarationKind(node: Statement): 'function' | 'value' | null {
  const declarator = soleDeclarator(node)
  if (!declarator) return null

  return isFunctionInit(declarator.init) ? 'function' : 'value'
}

function boundNames(node: Statement): Array<string> {
  const names: Array<string> = []
  collectIdentifiers(soleDeclarator(node)?.id, names)

  return names
}

function collectIdentifiers(node: unknown, names: Array<string>) {
  if (typeof node !== 'object' || node === null) return
  if (Array.isArray(node)) {
    for (const child of node) collectIdentifiers(child, names)

    return
  }
  if (!('type' in node)) return
  const typed = node as ESTree.Node
  if (typed.type === 'Identifier' || typed.type === 'JSXIdentifier') names.push(typed.name)
  for (const [key, value] of Object.entries(typed)) {
    if (key !== 'parent') collectIdentifiers(value, names)
  }
}

function referencesAny(node: Statement, names: ReadonlySet<string>): boolean {
  const used: Array<string> = []
  collectIdentifiers(soleDeclarator(node)?.init, used)

  return used.some((name) => names.has(name))
}

const adjacentPairs = <T>(items: ReadonlyArray<T>) =>
  items.slice(1).map((next, index) => [items[index] as T, next] as const)

export default defineRule({
  meta: {
    type: 'layout',
    fixable: 'whitespace',
    docs: {
      description:
        'Group declarations as values, then helpers, then the return, with blank lines between the groups and around multi-line top-level statements.',
    },
  },
  create(context) {
    const { sourceCode } = context
    const text = sourceCode.text

    const isMultiline = (node: Statement) => text.slice(node.range[0], node.range[1]).includes('\n')
    const hasBlankLine = (prev: Statement, next: Statement) =>
      BLANK_LINE.test(text.slice(prev.range[1], next.range[0]))

    function requireBlankLine(prev: Statement, next: Statement, message: string) {
      if (hasBlankLine(prev, next)) return
      const lineEnd = text.indexOf('\n', prev.range[1])
      context.report({
        node: next,
        message,
        fix:
          lineEnd === -1 || lineEnd > next.range[0]
            ? undefined
            : (fixer) => fixer.insertTextAfterRange([lineEnd, lineEnd], '\n'),
      })
    }

    function checkHelperOrder(body: ReadonlyArray<Statement>) {
      // Names a value may depend on to stay below the helpers: the helpers themselves,
      // and values that already depend on them.
      let dependents: Set<string> | null = null
      for (const statement of body) {
        const kind = declarationKind(statement)
        if (kind === null) {
          dependents = null
        } else if (kind === 'function') {
          dependents ??= new Set()
          for (const name of boundNames(statement)) dependents.add(name)
        } else if (dependents !== null) {
          if (referencesAny(statement, dependents)) {
            for (const name of boundNames(statement)) dependents.add(name)
          } else {
            context.report({
              node: statement,
              message:
                'Move this value above the helper functions: declare values first, then helpers.',
            })
          }
        }
      }
    }

    // Module scope groups helpers with the constants they belong to, so only the
    // multi-line spacing applies there.
    function checkModule(body: ReadonlyArray<Statement>) {
      for (const [prev, next] of adjacentPairs(body)) {
        if (prev.type === 'ImportDeclaration' && next.type === 'ImportDeclaration') continue
        if (isMultiline(prev) || isMultiline(next)) {
          requireBlankLine(prev, next, 'Surround multi-line top-level statements with blank lines.')
        }
      }
    }

    function checkBlock(body: ReadonlyArray<Statement>) {
      checkHelperOrder(body)
      for (const [prev, next] of adjacentPairs(body)) {
        const prevKind = declarationKind(prev)
        const nextKind = declarationKind(next)
        if (next.type === 'ReturnStatement') {
          requireBlankLine(prev, next, 'Add a blank line before the return.')
        } else if (prevKind !== nextKind && (prevKind === 'function' || nextKind === 'function')) {
          requireBlankLine(
            prev,
            next,
            'Separate helper functions from other statements with a blank line.',
          )
        }
      }
    }

    return {
      Program(node) {
        checkModule(node.body)
      },
      BlockStatement(node) {
        checkBlock(node.body)
      },
      StaticBlock(node) {
        checkBlock(node.body)
      },
    }
  },
})
