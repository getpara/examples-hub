import styled from 'styled-components';
import { useCapsuleStore, useThemeStore } from '../../stores/index.js';
import { CpslIdenticon, CpslText } from '@usecapsule/react-components';
import { truncateAddress, WalletType } from '@usecapsule/web-sdk';

interface Props {
  id: string;
  type: WalletType;
}

export const WalletCard = ({ id, type }: Props) => {
  const capsule = useCapsuleStore(state => state.capsule);
  const appName = useThemeStore(state => state.appName);

  const wallet = capsule.findWallet(id, type);

  if (!wallet) {
    return null;
  }

  const address = capsule.getDisplayAddress(wallet.id, { addressType: type });

  return (
    <Container>
      <InnerContainer>
        <CpslIdenticon size="30px" hash={capsule.getIdenticonHash(wallet.id, type)} />
        <WalletNameContainer>
          <Address color="contrast" variant="bodyL" weight="semiBold">
            {wallet.name ?? `${appName} Wallet`}
          </Address>
          <CpslText color="secondary" variant="bodyS" weight="medium">
            {truncateAddress(address, type, { prefix: capsule.cosmosPrefix })}
          </CpslText>
        </WalletNameContainer>
      </InnerContainer>
    </Container>
  );
};

export const WalletCards = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

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
