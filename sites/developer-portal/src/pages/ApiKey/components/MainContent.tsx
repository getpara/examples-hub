import { ReactNode, useEffect, useState } from 'react';
import styled from 'styled-components';
import { MOBILE_SIZE } from '../../../utils/constants';
import { ConfigurationTab } from './ConfigurationTab';
import { UsersTab } from './UsersTab';
import { Tabs } from '../../../components/Tabs/Tabs';
import { SetupTab } from './SetupTab';
import { useGetApiKeySetupStatus } from '../../../hooks/api/queries/useApiKeySetupStatus';
import { useParams } from 'react-router-dom';

const TABS = [
  {
    label: 'Setup',
    value: 'setup',
  },
  {
    label: 'Configuration',
    value: 'configuration',
  },
  {
    label: 'Users',
    value: 'users',
  },
];

export const MainContent = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: status } = useGetApiKeySetupStatus(projectId ?? '', apiKey ?? '', env ?? '');

  const [selectedTab, setSelectedTab] = useState(TABS[0].value);

  useEffect(() => {
    if (status?.firstUser && selectedTab === TABS[0].value) {
      setSelectedTab(TABS[1].value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleTabClick = (tab: string) => {
    setSelectedTab(tab);
  };

  const Content: { [k: string]: ReactNode } = {
    setup: <SetupTab />,
    configuration: <ConfigurationTab />,
    users: <UsersTab />,
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
