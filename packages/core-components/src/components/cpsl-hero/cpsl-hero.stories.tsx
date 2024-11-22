import type { Meta, StoryFn } from '@storybook/html';
import { type CpslHero } from './cpsl-hero.js';

const meta: Meta<CpslHero & { content?: string }> = {
  title: 'Components/CpslHero',
};

export default meta;

type Story = StoryFn<CpslHero & { content?: string }>;

const ConnectionTemplate: Story = () => `
<cpsl-hero variant="connection" title="Approve Transaction" subtitle="Please review the following transaction details">
  <cpsl-identicon size={62} hash="5yhg423546" slot="connectionLeft"></cpsl-identicon>
  <cpsl-identicon size={62} hash="884884fj4" slot="connectionRight"></cpsl-identicon>
</cpsl-hero>`;
const PendingTemplate: Story = () => `<cpsl-hero variant="pending"></cpsl-hero>`;
const ApprovedTemplate: Story = () => `<cpsl-hero variant="approved"></cpsl-hero>`;
const FailedTemplate: Story = () => `<cpsl-hero variant="failed"></cpsl-hero>`;

export const Connection: Story = ConnectionTemplate.bind({});
export const Pending: Story = PendingTemplate.bind({});
export const Approved: Story = ApprovedTemplate.bind({});
export const Failed: Story = FailedTemplate.bind({});
