import type { Meta, StoryObj } from '@storybook/react';

import { Separator } from './separator';

const meta = {
  component: Separator,
  tags: ['autodocs'],
} satisfies Meta<typeof Separator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div>
      <div className="para:space-y-1">
        <h4 className="para:text-sm para:font-medium para:leading-none">Radix Primitives</h4>
        <p className="para:text-sm para:text-muted-foreground">An open-source UI component library.</p>
      </div>
      <Separator className="para:my-4" />
      <div className="para:flex para:h-5 para:items-center para:space-x-4 para:text-sm">
        <div>Blog</div>
        <Separator orientation="vertical" />
        <div>Docs</div>
        <Separator orientation="vertical" />
        <div>Source</div>
      </div>
    </div>
  ),
};
