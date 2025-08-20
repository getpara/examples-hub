import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './button';
import { toast } from 'sonner';
import { Toaster } from './sonner';

const meta = {
  component: Toaster,
  tags: ['autodocs'],
} satisfies Meta<typeof Toaster>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="para:h-80">
      <Button
        variant="outline"
        onClick={() =>
          toast('Event has been created', {
            description: 'Sunday, December 03, 2023 at 9:00 AM',
            action: {
              label: 'Undo',
              onClick: () => console.warn('Undo'),
            },
          })
        }
      >
        Show Toast
      </Button>
      <Toaster />
    </div>
  ),
};
