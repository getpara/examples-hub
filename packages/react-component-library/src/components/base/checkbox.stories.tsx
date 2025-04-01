import type { Meta, StoryObj } from '@storybook/react';

import { Checkbox } from './checkbox';

const meta = {
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: { disabled: { control: 'boolean' } },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithText: Story = {
  render: ({ disabled }) => (
    <div className="para:items-top para:flex para:space-x-2">
      <Checkbox disabled={disabled} id="terms1" />
      <div className="para:grid para:gap-1.5 para:leading-none">
        <label
          htmlFor="terms1"
          className="para:text-sm para:font-medium para:leading-none para:peer-disabled:cursor-not-allowed para:peer-disabled:opacity-70"
        >
          Accept terms and conditions
        </label>
        <p className="para:text-sm para:text-muted-foreground">You agree to our Terms of Service and Privacy Policy.</p>
      </div>
    </div>
  ),
};
