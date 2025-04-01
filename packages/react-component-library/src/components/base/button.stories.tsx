import { Button } from '@/components/base';
import type { Meta, StoryObj } from '@storybook/react';
import { CheckIcon } from 'lucide-react';

const meta: Meta<typeof Button> = {
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'neutral'],
      control: 'inline-radio',
    },
    size: { options: ['default', 'sm', 'lg', 'icon'], control: 'inline-radio' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  args: {
    variant: 'default',
    children: 'Button',
    size: 'default',
  },
};

export const Icon: Story = {
  args: {
    variant: 'default',
    children: <CheckIcon />,
    size: 'default',
  },
};
