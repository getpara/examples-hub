import type { Meta, StoryObj } from '@storybook/react';

import { Avatar, AvatarFallback, AvatarImage } from './avatar';

type AvatarProps = typeof Avatar;

const meta = {
  component: Avatar,
  tags: ['autodocs'],

  render: () => {
    return (
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    );
  },
} satisfies Meta<AvatarProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
