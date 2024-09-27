import styled from 'styled-components';
import { useCapsuleStore, useThemeStore } from '../../stores/index.js';
import { CpslIdenticon, CpslText } from '@usecapsule/react-components';
import { truncateAddress, WalletType } from '@usecapsule/web-sdk';

export const ExternalWalletCard = ({ address }: Pick<SharedWalletCardProps, 'address'>) => {
  const capsule = useCapsuleStore(state => state.capsule);

  const wallet = capsule.externalWallets[address];

  if (!wallet) {
    return null;
  }

  return (
    <SharedWalletCard
      address={truncateAddress(address, wallet.type)}
      identiconHash={capsule.getIdenticonHash(wallet.id, wallet.type)}
    />
  );
};

interface WalletCardProps {
  id: string;
  type: WalletType;
}

export const WalletCard = ({ id, type }: WalletCardProps) => {
  const capsule = useCapsuleStore(state => state.capsule);
  const appName = useThemeStore(state => state.appName);

  const wallet = capsule.findWallet(id, type);

  if (!wallet) {
    return null;
  }

  const address = capsule.getDisplayAddress(wallet.id, { addressType: type });

  return (
    <SharedWalletCard
      address={truncateAddress(address, type, { prefix: capsule.cosmosPrefix })}
      name={wallet.name ?? `${appName ? `${appName} ` : ''}Wallet`}
      identiconHash={capsule.getIdenticonHash(wallet.id, type)}
    />
  );
};

interface SharedWalletCardProps {
  address: string;
  name?: string;
  identiconHash: string;
}
const SharedWalletCard = ({ address, name, identiconHash }: SharedWalletCardProps) => {
  return (
    <Container>
      <InnerContainer>
        <CpslIdenticon size="30px" hash={identiconHash} />
        <WalletNameContainer>
          {!!name && (
            <Address color="contrast" variant="bodyL" weight="semiBold">
              {name}
            </Address>
          )}
          <CpslText color="secondary" variant="bodyS" weight="medium">
            {address}
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
  &::part(text-element) {
    line-height: 100%;
  }
`;
