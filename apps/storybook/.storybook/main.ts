import type { StorybookConfig } from '@storybook/nextjs'
import { join, dirname } from 'path'

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')))
}

const config: StorybookConfig = {
  stories: ['../../../packages/ui/src/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  staticDirs: ['../public'],
  addons: [getAbsolutePath('@storybook/addon-essentials')],
  framework: {
    name: getAbsolutePath('@storybook/nextjs'),
    options: {
      nextConfigPath: '../next.config.mjs',
      builder: {},
    },
  },
  docs: {},
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
}

export default config
