import type { Meta, StoryObj } from '@storybook/react';

import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Label } from './label';
import { Input } from './input';
import { Button } from './button';

const meta = {
  component: Popover,
  tags: ['autodocs'],
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className="para:w-80">
        <div className="para:grid para:gap-4">
          <div className="para:space-y-2">
            <h4 className="para:font-medium para:leading-none">Dimensions</h4>
            <p className="para:text-sm para:text-muted-foreground">Set the dimensions for the layer.</p>
          </div>
          <div className="para:grid para:gap-2">
            <div className="para:grid grid-cols-3 para:items-center para:gap-4">
              <Label htmlFor="width">Width</Label>
              <Input id="width" defaultValue="100%" className="para:col-span-2 para:h-8" />
            </div>
            <div className="para:grid para:grid-cols-3 para:items-center para:gap-4">
              <Label htmlFor="maxWidth">Max. width</Label>
              <Input id="maxWidth" defaultValue="300px" className="para:col-span-2 para:h-8" />
            </div>
            <div className="para:grid para:grid-cols-3 para:items-center para:gap-4">
              <Label htmlFor="height">Height</Label>
              <Input id="height" defaultValue="25px" className="para:col-span-2 para:h-8" />
            </div>
            <div className="para:grid para:grid-cols-3 para:items-center para:gap-4">
              <Label htmlFor="maxHeight">Max. height</Label>
              <Input id="maxHeight" defaultValue="none" className="para:col-span-2 para:h-8" />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};
