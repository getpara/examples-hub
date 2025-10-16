import { safeStyled, WalletTypeIcon } from '@getpara/react-common';
import { useModalStore } from '../../stores/index.js';
import { CpslButton, CpslIcon, CpslText } from '@getpara/react-components';
import { truncateAddress, TWalletType } from '@getpara/web-sdk';
import { ModalStep } from '../../utils/steps.js';
import { useWalletState } from '../../../provider/index.js';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import { useStore } from '../../../provider/stores/useStore.js';
import { ReactNode } from 'react';

export const ExternalWalletCard = ({
  address,
  showAddFunds,
}: Pick<SharedWalletCardProps, 'showAddFunds'> & { address: string }) => {
  const para = useInternalClient();

  const wallet = para.externalWallets[address];

  if (!wallet?.address || !wallet?.type) {
    return null;
  }

  return (
    <SharedWalletCard
      name={wallet.name}
      address={wallet.ensName ?? truncateAddress(wallet.address, wallet.type)}
      showAddFunds={showAddFunds}
      Icon={
        <WalletTypeIcon
          externalWallet={wallet.externalProviderId}
          walletType={wallet.type}
          size="48px"
          inset="6px"
          radius="theme"
          background="var(--cpsl-color-background-0)"
          border="1px solid var(--cpsl-color-background-16)"
        />
      }
    />
  );
};

interface WalletCardProps {
  id: string;
  type: TWalletType;
  showAddFunds?: boolean;
}

export const WalletCard = ({ id, type, showAddFunds }: WalletCardProps) => {
  const para = useInternalClient();
  const appName = useStore(state => state.appName);

  const wallet = para.findWallet(id, type);

  if (!wallet) {
    return null;
  }

  return (
    <SharedWalletCard
      id={wallet.id}
      type={wallet.type}
      name={wallet.name ?? `${appName ? `${appName} ` : ''}Wallet`}
      showAddFunds={showAddFunds}
      Icon={
        <CpslIcon
          icon={para.partnerLogo ? undefined : 'wallet02'}
          src={para.partnerLogo}
          color="var(--cpsl-color-text-contrast)"
          radius="theme"
          background="var(--cpsl-color-background-0)"
          border="1px solid var(--cpsl-color-background-16)"
          size="48px"
          inset={para.partnerLogo ? '8px' : '12px'}
        />
      }
    />
  );
};

interface SharedWalletCardProps {
  address?: string;
  id?: string;
  type?: TWalletType;
  name?: string;
  showAddFunds?: boolean;
  Icon: ReactNode;
}

const SharedWalletCard = ({ address, name, showAddFunds, id, type, Icon }: SharedWalletCardProps) => {
  const onRampConfig = useModalStore(state => state.onRampConfig);
  const { setSelectedWallet } = useWalletState();
  const setStep = useModalStore(state => state.setStep);

  const isAddFundsEnabled = onRampConfig?.isBuyEnabled || onRampConfig?.isReceiveEnabled;
  const handleAddFundsClick = () => {
    if (id && type) {
      setSelectedWallet({ id, type });
      isAddFundsEnabled && setStep(onRampConfig.isBuyEnabled ? ModalStep.ADD_FUNDS_BUY : ModalStep.ADD_FUNDS_RECEIVE);
    }
  };

  return (
    <Container>
      <InnerContainer>
        {Icon}
        <WalletNameContainer>
          {!!name && (
            <Name color="contrast" variant="bodyL" weight="semiBold">
              {name}
            </Name>
          )}
          {!!address && (
            <Name color="secondary" variant="bodyS" weight="medium">
              {address}
            </Name>
          )}
        </WalletNameContainer>
      </InnerContainer>
      {showAddFunds && isAddFundsEnabled && (
        <AddFundsButton onClick={handleAddFundsClick}>
          <CpslText variant="bodyXS" color="contrast" weight="medium">
            Add Funds
          </CpslText>
        </AddFundsButton>
      )}
    </Container>
  );
};

export const WalletCards = safeStyled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const Container = safeStyled.div`
  width: 100%;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  background-color: var(--cpsl-color-background-8);
  border-radius: 16px;
`;

const InnerContainer = safeStyled.div`
  display: flex;
  justify-content: flex-start;
  gap: 8px;
  align-items: center;
  overflow: hidden;
`;

const WalletNameContainer = safeStyled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  justify-content: center;
  overflow: hidden;
`;

const Name = safeStyled(CpslText)`
  width: 100%;
  &::part(text-element) {
    line-height: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
`;

const AddFundsButton = safeStyled(CpslButton)`
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
