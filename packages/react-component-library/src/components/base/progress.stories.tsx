import type { Meta, StoryObj } from '@storybook/react';

import { Progress } from './progress';

const meta = {
  component: Progress,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'number' },
  },
  args: {
    value: 50,
  },
} satisfies Meta<typeof Progress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => <Progress {...args} />,
};
