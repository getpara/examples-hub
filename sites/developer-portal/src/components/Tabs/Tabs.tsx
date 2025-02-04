import styled from 'styled-components';
import { CpslButton, CpslText } from '@getpara/react-components';

export type TabType = {
  label: string;
  value: string;
};

interface TabsProps {
  tabs: TabType[];
  selectedTab: string;
  onTabSelect: (tab: string) => void;
}

export const Tabs = ({ tabs, selectedTab, onTabSelect }: TabsProps) => {
  const handleTabClick = (tab: string) => () => {
    onTabSelect(tab);
  };

  return (
    <TabContainer>
      {tabs.map(tab => (
        <Tab $selected={selectedTab === tab.value} key={tab.value} variant="ghost" onClick={handleTabClick(tab.value)}>
          <CpslText variant="headingXS" weight="medium">
            {tab.label}
          </CpslText>
        </Tab>
      ))}
    </TabContainer>
  );
};

const TabContainer = styled.div`
  display: flex;
  flex: 1;
  padding: 8px 0px;
  gap: 24px;
  border-bottom: 1px solid var(--cpsl-color-background-16);
`;

const Tab = styled(CpslButton)<{ $selected: boolean }>`
  ${({ $selected }) => ($selected ? '--button-ghost-color: var(--cpsl-color-text-primary);' : '')};
`;
