import { definePlugin } from '@oxlint/plugins'

import noEmDashCopy from './rules/no-em-dash-copy.ts'
import noHooklessUseFunction from './rules/no-hookless-use-function.ts'
import noLowValueComments from './rules/no-low-value-comments.ts'
import noManualMemo from './rules/no-manual-memo.ts'
import noNativeTitleTooltip from './rules/no-native-title-tooltip.ts'
import noUnreasonedStateSync from './rules/no-unreasoned-state-sync.ts'
import noRawResizeObserver from './rules/no-raw-resize-observer.ts'
import noUnscopedHas from './rules/no-unscoped-has.ts'
import requireCenteredScrollGutter from './rules/require-centered-scroll-gutter.ts'
import statementPadding from './rules/statement-padding.ts'
import tailwindScale from './rules/tailwind-scale.ts'

export default definePlugin({
  meta: {
    name: 'valley',
  },
  rules: {
    'no-em-dash-copy': noEmDashCopy,
    'no-hookless-use-function': noHooklessUseFunction,
    'no-low-value-comments': noLowValueComments,
    'no-manual-memo': noManualMemo,
    'no-native-title-tooltip': noNativeTitleTooltip,
    'no-raw-resize-observer': noRawResizeObserver,
    'no-unreasoned-state-sync': noUnreasonedStateSync,
    'no-unscoped-has': noUnscopedHas,
    'require-centered-scroll-gutter': requireCenteredScrollGutter,
    'statement-padding': statementPadding,
    'tailwind-scale': tailwindScale,
  },
})
