import { ReactNode, useState } from 'react';
import styled from 'styled-components';
import { MOBILE_SIZE } from '../../../utils/constants';
import { Tabs } from '../../../components/Tabs/Tabs';
import { BillingTab } from './BillingTab';
import { MembersTable } from './MembersTable';

const TABS = [
  {
    label: 'Billing',
    value: 'billing',
  },
  {
    label: 'Members',
    value: 'members',
  },
];

export const MainContent = () => {
  const [selectedTab, setSelectedTab] = useState(TABS[0].value);

  const handleTabClick = (tab: string) => {
    setSelectedTab(tab);
  };

  const Content: { [k: string]: ReactNode } = {
    billing: <BillingTab />,
    members: <MembersTable />,
  };

  return (
    <Container>
      <Tabs tabs={TABS} selectedTab={selectedTab} onTabSelect={handleTabClick} />
      {Content[selectedTab]}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;

  @media (max-width: ${MOBILE_SIZE}px) {
    gap: 16px;
  }
  @media (min-width: ${MOBILE_SIZE + 1}px) {
    gap: 24px;
  }
`;
