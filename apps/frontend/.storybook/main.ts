import type { StorybookConfig } from '@storybook/nextjs'

const config: StorybookConfig = {
  stories: ['../src/app/components/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/nextjs',
    options: {
      nextConfigPath: '../next.config.mjs',
      builder: {
        useSWC: true,
      },
    },
  },
}

export default config
