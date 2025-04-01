import type { Meta, StoryObj } from '@storybook/react';

import { Alert, AlertDescription, AlertTitle } from './alert';
import { TriangleAlert } from 'lucide-react';

type AlertProps = typeof Alert;

const meta = {
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    variant: { options: ['default', 'destructive'], control: 'inline-radio' },
  },

  render: ({ title, description, ...args }: AlertProps & { title?: string; description?: string }) => {
    return (
      <Alert {...args}>
        <TriangleAlert className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
    );
  },
} satisfies Meta<AlertProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'default',
    title: 'Heads up!',
    description: 'You can add components and dependencies to your app using the cli.',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    title: 'Error!',
    description: 'Error text.',
  },
};
