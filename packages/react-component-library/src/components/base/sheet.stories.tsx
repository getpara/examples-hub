import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet';

const meta = {
  component: Sheet,
  tags: ['autodocs'],
} satisfies Meta<typeof Sheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>Make changes to your profile here. Click save when you're done.</SheetDescription>
        </SheetHeader>
        <div className="para:grid para:gap-4 para:p-4">
          <div className="para:grid para:grid-cols-4 para:items-center para:gap-4">
            <Label htmlFor="name" className="para:text-right">
              Name
            </Label>
            <Input id="name" value="Pedro Duarte" className="para:col-span-3" />
          </div>
          <div className="para:grid para:grid-cols-4 para:items-center para:gap-4">
            <Label htmlFor="username" className="para:text-right">
              Username
            </Label>
            <Input id="username" value="@peduarte" className="para:col-span-3" />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};
