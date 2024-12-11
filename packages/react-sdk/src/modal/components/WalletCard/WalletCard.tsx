import styled from 'styled-components';
import { useCapsuleStore, useModalStore, useThemeStore } from '../../stores/index.js';
import { CpslButton, CpslIdenticon, CpslText } from '@usecapsule/react-components';
import { truncateAddress, WalletType } from '@usecapsule/web-sdk';
import { useBuyCryptoClick } from '../../hooks/useBuyCryptoClick.js';

export const ExternalWalletCard = ({ address, showAddFunds }: Pick<SharedWalletCardProps, 'address' | 'showAddFunds'>) => {
  const capsule = useCapsuleStore(state => state.capsule);

  const wallet = capsule.externalWallets[address];

  if (!wallet) {
    return null;
  }

  return (
    <SharedWalletCard
      address={truncateAddress(wallet.address, wallet.type)}
      identiconHash={capsule.getIdenticonHash(wallet.id, wallet.type)}
      showAddFunds={showAddFunds}
    />
  );
};

interface WalletCardProps {
  id: string;
  type: WalletType;
  showAddFunds?: boolean;
}

export const WalletCard = ({ id, type, showAddFunds }: WalletCardProps) => {
  const capsule = useCapsuleStore(state => state.capsule);
  const appName = useThemeStore(state => state.appName);

  const wallet = capsule.findWallet(id, type);

  if (!wallet) {
    return null;
  }

  const address = capsule.getDisplayAddress(wallet.id, { addressType: type });

  return (
    <SharedWalletCard
      id={wallet.id}
      type={wallet.type}
      address={truncateAddress(address, type, { prefix: capsule.cosmosPrefix })}
      name={wallet.name ?? `${appName ? `${appName} ` : ''}Wallet`}
      identiconHash={capsule.getIdenticonHash(wallet.id, type)}
      showAddFunds={showAddFunds}
    />
  );
};

interface SharedWalletCardProps {
  address: string;
  id?: string;
  type?: WalletType;
  name?: string;
  identiconHash: string;
  showAddFunds?: boolean;
}
const SharedWalletCard = ({ address, name, identiconHash, showAddFunds, id, type }: SharedWalletCardProps) => {
  const setActiveWallet = useModalStore(state => state.setActiveWallet);
  const onBuyCryptoClick = useBuyCryptoClick();

  const handleAddFundsClick = () => {
    if (id && type) {
      setActiveWallet([id, type]);
      onBuyCryptoClick();
    }
  };

  return (
    <Container>
      <InnerContainer>
        <CpslIdenticon size="48px" hash={identiconHash} />
        <WalletNameContainer>
          {!!name && (
            <Name color="contrast" variant="bodyL" weight="semiBold">
              {name}
            </Name>
          )}
          <Name color="secondary" variant="bodyS" weight="medium">
            {address}
          </Name>
        </WalletNameContainer>
      </InnerContainer>
      {showAddFunds && (
        <AddFundsButton onClick={handleAddFundsClick}>
          <CpslText variant="bodyXS" color="contrast" weight="medium">
            Add Funds
          </CpslText>
        </AddFundsButton>
      )}
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
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  background-color: var(--cpsl-color-background-8);
  border-radius: 16px;
`;

const InnerContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 4px;
  align-items: center;
  overflow: hidden;
`;

const WalletNameContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  justify-content: center;
  overflow: hidden;
`;

const Name = styled(CpslText)`
  width: 100%;
  &::part(text-element) {
    line-height: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
`;

const AddFundsButton = styled(CpslButton)`
  --button-primary-background-color: var(--cpsl-color-card-surface);
  --button-primary-hover-background-color: var(--cpsl-color-background-4);
  --button-primary-color: var(--cpsl-color-text-contrast);
  --button-primary-hover-color: var(--cpsl-color-text-contrast);
  --button-primary-active-color: var(--cpsl-color-text-contrast);
  --button-padding-start: 8px;
  --button-padding-end: 8px;
  --button-padding-top: 8px;
  --button-padding-bottom: 8px;
  --button-border-radius: 8px;
`;
