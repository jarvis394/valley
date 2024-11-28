import type { StorybookConfig } from '@storybook/react-vite'
import { join, dirname } from 'path'

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')))
}

const config: StorybookConfig = {
  stories: ['../../../packages/ui/src/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  staticDirs: ['../public'],
  addons: [getAbsolutePath('@storybook/addon-essentials')],
  framework: getAbsolutePath('@storybook/react-vite'),
  docs: {},
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
}

export default config
