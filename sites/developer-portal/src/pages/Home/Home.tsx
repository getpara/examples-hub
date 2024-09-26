import styled from 'styled-components';
import { ReactNode, useState } from 'react';
import { Tabs } from '../../components/Tabs/Tabs';
import { AnalyticsTab } from './components/AnalyticsTab';
// import { UsersTab } from './components/UsersTab';
import { ProjectsTab } from './components/ProjectsTab';
import { CpslText } from '@usecapsule/react-components';
import { useGetSelectedOrganization } from '../../hooks/api/queries/useOrganizations';

const TABS = [
  {
    label: 'Analytics',
    value: 'analytics',
  },
  {
    label: 'Projects',
    value: 'projects',
  },
  // {
  //   label: 'Users',
  //   value: 'users',
  // },
];

export const Home = () => {
  const { data: organization } = useGetSelectedOrganization();

  const [selectedTab, setSelectedTab] = useState(TABS[0].value);

  const handleTabClick = (tab: string) => {
    setSelectedTab(tab);
  };

  const Content: { [k: string]: ReactNode } = {
    analytics: <AnalyticsTab />,
    projects: <ProjectsTab />,
    // users: <UsersTab />,
  };

  return (
    <Container>
      <CpslText variant="headingS" weight="semiBold">
        {organization?.name}
      </CpslText>
      <Tabs tabs={TABS} selectedTab={selectedTab} onTabSelect={handleTabClick} />
      <ContentContainer>{Content[selectedTab]}</ContentContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1200px;
`;
