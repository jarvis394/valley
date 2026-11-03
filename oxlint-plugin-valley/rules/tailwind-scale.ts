import { defineRule, type ESTree } from '@oxlint/plugins'

const TYPE_STYLES =
  'text-caption, text-label, text-small, text-body, text-title, text-heading or text-display'

// Utilities whose bare number means `n * --spacing` (4px) in Tailwind v4.
const SPACING_PX =
  /(?<=^|[\s'"`:!])(-?)((?:p|m|scroll-p|scroll-m)[trblxyse]?|gap(?:-[xy])?|[wh]|size|min-[wh]|max-[wh]|top|right|bottom|left|inset(?:-[xy])?|start|end|translate-[xy]|space-[xy]|leading|basis|indent)-\[(\d+)px\](?=$|[\s'"`])/gu

const FONT_SIZE =
  /(?<=^|[\s'"`:!])text-(?:\[\d+(?:\.\d+)?(?:px|rem)\]|xs|sm|base|lg|xl|[2-9]xl)(?=$|[\s'"`])/gu

export default defineRule({
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description:
        'Use Tailwind spacing steps instead of arbitrary px, and the theme type scale instead of raw font sizes.',
    },
  },
  create(context) {
    const { sourceCode } = context

    function check(node: ESTree.Node) {
      const [start, end] = node.range
      const raw = sourceCode.text.slice(start, end)

      for (const match of raw.matchAll(SPACING_PX)) {
        const [token, negative, utility, px] = match
        const replacement = `${negative}${utility}-${Number(px) / 4}`
        const from = start + match.index
        context.report({
          node,
          message: `Use ${replacement} instead of ${token}: spacing steps are 4px.`,
          fix: (fixer) => fixer.replaceTextRange([from, from + token.length], replacement),
        })
      }

      for (const match of raw.matchAll(FONT_SIZE)) {
        context.report({
          node,
          message: `Replace ${match[0]} with a type style from packages/ui/src/styles.css: ${TYPE_STYLES}.`,
        })
      }
    }

    return {
      Literal(node) {
        if (typeof node.value === 'string') check(node)
      },
      TemplateElement: check,
    }
  },
})
