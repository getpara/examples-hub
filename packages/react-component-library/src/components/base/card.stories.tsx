import type { Meta, StoryObj } from '@storybook/react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';

type CardProps = typeof Card;

const meta = {
  component: Card,
  tags: ['autodocs'],

  render: ({
    title,
    description,
    content,
    footer,
  }: CardProps & { title: string; description: string; content: string; footer: string }) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{content}</p>
        </CardContent>
        <CardFooter>
          <p>{footer}</p>
        </CardFooter>
      </Card>
    );
  },
} satisfies Meta<CardProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Card Title',
    description: 'Card Description',
    content: 'Card Content',
    footer: 'Card Footer',
  },
};
