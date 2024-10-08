import type { Meta, StoryObj } from '@storybook/react'
import Button, { ButtonProps } from './Button'
import { RefAttributes } from 'react'
import { JSX } from 'react/jsx-runtime'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: {
    children: 'Label',
  },
  argTypes: {
    variant: {
      options: [
        'primary',
        'secondary',
        'danger',
        'warning',
        'tertiary',
        'secondary-dimmed',
        'tertiary-dimmed',
      ],
      control: { type: 'select' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
    loading: {
      control: { type: 'boolean' },
    },
    size: {
      options: ['sm', 'md', 'lg'],
      control: { type: 'select' },
    },
  },
  render: (
    args: JSX.IntrinsicAttributes &
      (ButtonProps & RefAttributes<HTMLButtonElement>)
  ) => <Button {...args} />,
}
