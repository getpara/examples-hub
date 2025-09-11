import styled from 'styled-components';
import { CpslCard, CpslIcon, CpslText } from '@getpara/react-components';
import { OAuthMethods } from './OAuthMethods';
import { ExternalWallets } from './ExternalWallets';
import { AuthLayouts } from './AuthLayouts';
import { Theme } from './Theme';
import { AccountLinking } from './AccountLinking';
import { Balances } from './Balances';
import { useAccount } from '@getpara/react-sdk';
import { memo } from 'react';

export const ModalConfig = memo(() => {
  const { embedded } = useAccount();
  return (
    <CpslCard>
      <CpslText variant="headingXS" weight="semiBold">
        Modal Configuration
      </CpslText>
      <InnerContainer>
        <TopComponentsGrid>
          <Theme />
          <VerticalStack>
            <AuthLayouts />
            <OAuthMethods />
          </VerticalStack>
          <ExternalWallets />
        </TopComponentsGrid>
        <Balances />
        {embedded?.isConnected && !embedded?.isGuestMode && <AccountLinking />}
      </InnerContainer>
    </CpslCard>
  );
});

const InnerContainer = styled.div`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;

  @media (max-width: 640px) {
    gap: 16px;
    margin-top: 4px;
  }
`;

const TopComponentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const VerticalStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;

  @media (max-width: 640px) {
    gap: 8px;
  }
`;

export const LabelContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const FlexRow = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 4px;
`;

export const MethodRow = styled(FlexRow)`
  justify-content: space-between;
  width: 250px;
`;

export const OptionRow = styled(FlexRow)`
  flex: 1;
  align-items: flex-end;
  flex-wrap: wrap;
`;

export const DownIcon = styled(CpslIcon)`
  transform: rotate(180deg);
`;
