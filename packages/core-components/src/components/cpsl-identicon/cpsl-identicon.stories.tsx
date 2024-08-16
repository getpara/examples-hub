import type { Meta, StoryFn } from '@storybook/html';
import { type CpslIdenticon } from './cpsl-identicon';

const meta: Meta<CpslIdenticon & { content?: string }> = {
  title: 'Components/CpslIdenticon',
  args: { hash: 'wruvbwic8932nc4u3cr9394n3cibj3892438cr', size: 40 },
  argTypes: {
    hash: { control: 'text' },
    size: { control: 'number' },
  },
};

export default meta;

type Story = StoryFn<CpslIdenticon & { content?: string }>;

const Template: Story = args => `<cpsl-identicon hash=${args.hash}/>`;

export const Primary: Story = Template.bind({});
