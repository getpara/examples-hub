import type { Meta, StoryObj } from '@storybook/react';

import { MultiSelect } from './multi-select';

const meta = {
  component: MultiSelect,
  tags: ['autodocs'],
} satisfies Meta<typeof MultiSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <MultiSelect
        options={[
          { label: 'One', value: 'one' },
          { label: 'Two', value: 'two' },
        ]}
        placeholder="Select multiple"
        emptyIndicator="No Results"
      />
      <div className="para:h-30" />
    </>
  ),
};
