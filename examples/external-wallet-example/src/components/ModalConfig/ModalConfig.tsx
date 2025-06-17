import styled from 'styled-components';
import { CpslCard, CpslIcon, CpslText } from '@getpara/react-components';
import { OAuthMethods } from './OAuthMethods';
import { ExternalWallets } from './ExternalWallets';
import { AuthLayouts } from './AuthLayouts';
import { Theme } from './Theme';
import { AccountLinking } from './AccountLinking';
import { useAccount } from '@getpara/react-sdk';

export const ModalConfig = () => {
  const { data: account } = useAccount();
  return (
    <CpslCard>
      <CpslText variant="headingXS" weight="semiBold">
        Modal Configuration
      </CpslText>
      <InnerContainer>
        <Theme />
        <OAuthMethods />
        <ExternalWallets />
        <AuthLayouts />
        {account?.isConnected && !account?.isGuestMode && <AccountLinking />}
      </InnerContainer>
    </CpslCard>
  );
};

const InnerContainer = styled.div`
  flex-wrap: wrap;
  margin-top: 8px;
  display: flex;
  gap: 24px;
`;

export const LabelContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const FlexRow = styled.div`
  display: flex;
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
