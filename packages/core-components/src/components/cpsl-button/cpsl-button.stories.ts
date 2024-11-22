import type { Meta, StoryFn } from '@storybook/html';
import { type CpslButton } from './cpsl-button.js';

const meta: Meta<CpslButton & { content?: string }> = {
  title: 'Components/CpslButton',
  args: { variant: 'primary', size: 'medium', content: 'Test' },
  argTypes: {
    variant: {
      control: {
        type: 'select',
      },
      options: ['primary', 'secondary', 'ghost', 'destructive'],
    },
    size: {
      control: {
        type: 'select',
      },
      options: ['small', 'medium'],
    },
  },
};

export default meta;

type Story = StoryFn<CpslButton & { content?: string }>;

const Template: Story = args => `<cpsl-button variant="${args.variant}" size="${args.size}">${args.content}</cpsl-button>`;
const TemplateWithIcon: Story = args => `<cpsl-button variant="${args.variant}" size="${args.size}"><cpsl-icon icon="home" slot="start"></cpsl-icon>${args.content}</cpsl-button>`;

export const Primary: Story = Template.bind({});
Primary.args = {
  content: 'Primary',
};

export const Secondary: Story = Template.bind({});
Secondary.args = {
  content: 'Secondary',
  variant: 'secondary',
};

export const Ghost: Story = Template.bind({});
Ghost.args = {
  content: 'Ghost',
  variant: 'ghost',
};

export const Destructive: Story = Template.bind({});
Destructive.args = {
  content: 'Destructive',
  variant: 'destructive',
};

export const Icon: Story = TemplateWithIcon.bind({});
Icon.args = {
  content: '',
  variant: 'ghost',
};

export const PrimaryWithIcon: Story = TemplateWithIcon.bind({});
PrimaryWithIcon.args = {
  content: 'Primary With Icon',
};
