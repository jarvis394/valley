import type { Meta, StoryObj } from '@storybook/react'
import Button, { ButtonProps } from './Button'
import { RefAttributes } from 'react'
import { JSX } from 'react/jsx-runtime'
import Divider from '../Divider/Divider'
import Stack from '../Stack/Stack'
import { ChevronRight, Plus } from 'geist-ui-icons'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'fullscreen',
  },
}

const variants: Array<ButtonProps['variant']> = [
  'primary',
  'secondary',
  'danger',
  'warning',
  'tertiary',
  'secondary-dimmed',
  'tertiary-dimmed',
]

export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: {
    children: 'Label',
  },
  argTypes: {
    variant: {
      options: variants,
      control: { type: 'select' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
    loading: {
      control: { type: 'boolean' },
    },
    before: {
      control: { type: 'boolean' },
    },
    after: {
      control: { type: 'boolean' },
    },
    fullWidth: {
      control: { type: 'boolean' },
    },
    align: {
      control: { type: 'select' },
      table: {
        defaultValue: { summary: 'center' },
      },
      options: ['start', 'center', 'end'],
    },
    size: {
      options: ['sm', 'md', 'lg'],
      control: { type: 'select' },
    },
  },
  render: ({
    before,
    after,
    ...args
  }: JSX.IntrinsicAttributes &
    (ButtonProps & RefAttributes<HTMLButtonElement>)) => (
    <Stack gap={2} direction={'column'}>
      <Button
        {...args}
        before={before ? <Plus /> : undefined}
        after={after ? <ChevronRight /> : undefined}
        size="sm"
      />
      <Button
        {...args}
        before={before ? <Plus /> : undefined}
        after={after ? <ChevronRight /> : undefined}
        size="md"
      />
      <Button
        {...args}
        before={before ? <Plus /> : undefined}
        after={after ? <ChevronRight /> : undefined}
        size="lg"
      />
      <Divider />
      {variants.map((variant) => (
        <Stack key={variant} gap={2} direction={'column'}>
          <h2>{variant}</h2>
          <Button variant={variant} size="sm">
            {args.children || 'Label'}
          </Button>
          <Button variant={variant} size="md">
            {args.children || 'Label'}
          </Button>
          <Button variant={variant} size="lg">
            {args.children || 'Label'}
          </Button>
        </Stack>
      ))}
    </Stack>
  ),
}
