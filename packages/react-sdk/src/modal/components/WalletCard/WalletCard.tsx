import styled from 'styled-components';
import { useCapsuleStore } from '../../stores/index.js';
import { CpslIdenticon, CpslText } from '@usecapsule/react-components';
import { formatWalletAddress } from '../../utils/stringFormatters.js';

export const WalletCard = () => {
  const capsule = useCapsuleStore(state => state.capsule);

  const currentWalletId = capsule.currentWalletIds?.[0];

  if (!currentWalletId) {
    return null;
  }

  const currentWallet = capsule.wallets[currentWalletId];
  currentWallet.partner.logoUrl;
  const walletAddress = currentWallet.address;
  const walletName = currentWallet.name;

  return (
    <Container>
      <InnerContainer>
        <WalletIcon hash={walletAddress} />
        <WalletNameContainer>
          <Address color="contrast" variant="bodyL" weight="semiBold">
            {walletName}
          </Address>
          <CpslText color="secondary" variant="bodyS" weight="medium">
            {formatWalletAddress(walletAddress)}
          </CpslText>
        </WalletNameContainer>
      </InnerContainer>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: var(--cpsl-color-background-0);
  border: 1px solid var(--cpsl-color-background-32);
  border-radius: 16px;
`;

const InnerContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 8px;
  align-items: center;
`;

const WalletNameContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
`;

const Address = styled(CpslText)`
  line-height: 100%;
`;

const WalletIcon = styled(CpslIdenticon)`
  height: 30px;
  width: 30px;
`;
