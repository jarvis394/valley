import { defineRule, type ESTree } from '@oxlint/plugins'

const EFFECT_HOOKS = new Set(['useEffect', 'useLayoutEffect', 'useInsertionEffect'])
const EFFECT_HOOK_TEXT = /use(?:Layout|Insertion)?Effect/
const TEST_FILE = /\.(?:test|spec)\.[cm]?[jt]sx?$|[\\/](?:tests?|__tests__)[\\/]/

const isEffectHookCall = (node: ESTree.CallExpression): boolean => {
  let callee: ESTree.Node = node.callee
  while (
    callee.type === 'ChainExpression' ||
    callee.type === 'ParenthesizedExpression' ||
    callee.type === 'TSNonNullExpression' ||
    callee.type === 'TSAsExpression' ||
    callee.type === 'TSTypeAssertion'
  ) {
    callee = callee.expression
  }
  if (callee.type === 'Identifier') return EFFECT_HOOKS.has(callee.name)
  return (
    callee.type === 'MemberExpression' &&
    !callee.computed &&
    callee.property.type === 'Identifier' &&
    EFFECT_HOOKS.has(callee.property.name)
  )
}

// Agents act on this message, so it lists the alternatives before the disable syntax.
const MESSAGE =
  'Stop and reconsider before keeping this effect. ' +
  'Is it computable from props or state? Compute it during render; the compiler memoizes it. ' +
  'Does it respond to a user action? Do it in that handler. ' +
  'Does it reset state when a prop changes? Key the component on that prop. ' +
  'Does it tell a parent or store that a value changed? Do it where the change happens. ' +
  'Does it read a value from outside React? Use useSyncExternalStore. ' +
  'An effect that sets state another effect reads is one handler or one derivation. ' +
  'An effect is right only when it keeps something outside React in step with this component while mounted: ' +
  'a DOM node, listener, timer, connection, or a resource held until unmount. ' +
  'Moving the same logic into a ref or store to dodge this rule is not a fix. ' +
  'If the effect does that, name what it keeps in step on the line above: ' +
  '`// oxlint-disable-next-line valley/no-unreasoned-state-sync -- <what it syncs with and why>`.'

export default defineRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Report every React effect hook, the usual way state gets synchronized; one that stays says why.',
    },
  },
  create(context) {
    if (TEST_FILE.test(context.filename) || !EFFECT_HOOK_TEXT.test(context.sourceCode.text)) {
      return {}
    }
    return {
      CallExpression(node) {
        if (!isEffectHookCall(node)) return
        context.report({
          node,
          message: MESSAGE,
        })
      },
    }
  },
})
