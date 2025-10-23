import { safeStyled, SpinnerContainer } from '@getpara/react-common';
import { CpslButton, CpslIcon, CpslSpinner } from '@getpara/react-components';
import { useModalStore } from '../../stores/modal/useModalStore.js';
import { WalletEntry } from './AccountProfileEntry.js';
import { TWalletType } from '@getpara/web-sdk';
import { useEffect, useMemo } from 'react';
import { useAccount, useExportPrivateKey } from '../../../provider/index.js';
import { useExternalWallets } from '../../../provider/providers/ExternalWalletProvider.js';
import { ModalStep } from '../../utils/steps.js';

const EXPLORERS = {
  EVM: {
    name: 'Etherscan',
    url: address => `https://etherscan.io/address/${address}`,
  },
  SOLANA: {
    name: 'Solana Explorer',
    url: address => `https://explorer.solana.com/address/${address}`,
  },
  COSMOS: {
    name: 'Atomscan',
    url: address => `https://atomscan.com/accounts/${address}`,
  },
};

export const AccountWallet = () => {
  const profileWallet = useModalStore(state => state.profileWallet);
  const setProfileWallet = useModalStore(state => state.setProfileWallet);
  const setStep = useModalStore(state => state.setStep);
  const { connectionType } = useAccount();
  const { mutate: exportPrivateKey } = useExportPrivateKey();
  const { disconnectBase, evmDisconnectStatus, solanaDisconnectStatus, cosmosDisconnectStatus } = useExternalWallets();

  const disconnectStatus = useMemo(() => {
    if (!profileWallet?.isExternal) {
      return 'idle';
    }
    switch (profileWallet.type) {
      case 'EVM':
        return evmDisconnectStatus;
      case 'SOLANA':
        return solanaDisconnectStatus;
      case 'COSMOS':
      default:
        return cosmosDisconnectStatus;
    }
  }, [profileWallet?.isExternal, profileWallet?.type, evmDisconnectStatus, solanaDisconnectStatus, cosmosDisconnectStatus]);

  const Content = useMemo(() => {
    if (!profileWallet) {
      return null;
    }

    if (disconnectStatus === 'pending') {
      return (
        <SpinnerContainer>
          <CpslSpinner />
        </SpinnerContainer>
      );
    }

    const { name, url } = EXPLORERS[profileWallet.type!];

    return (
      <>
        <WalletEntry
          key={`${profileWallet.address}-${profileWallet.type}`}
          wallet={profileWallet}
          style={{ marginBottom: '16px' }}
        />
        {typeof window !== 'undefined' && (
          <CpslButton
            variant="tertiary"
            fullWidth
            onClick={() => {
              window.open(url(profileWallet.address), '_blank');
            }}
          >
            View wallet on {name}
            <CpslIcon icon="linkExternal" slot="end" />
          </CpslButton>
        )}
        {!profileWallet.isExternal && ['EVM', 'COSMOS'].includes(profileWallet.type! as TWalletType) && (
          <DestructiveButton
            variant="destructive"
            fullWidth
            onClick={() => exportPrivateKey({ walletId: profileWallet.id, shouldOpenPopup: true })}
          >
            <CpslIcon icon="key" slot="start" />
            Export private key
          </DestructiveButton>
        )}
        {profileWallet.isExternal && connectionType === 'both' && (
          <DestructiveButton
            variant="destructive"
            fullWidth
            onClick={async () => {
              await disconnectBase(profileWallet.externalProviderId!, profileWallet.type!, {
                disconnectType: 'ACCOUNT_WIDGET',
              });

              setProfileWallet(undefined);
              setStep(ModalStep.ACCOUNT_PROFILE);
            }}
          >
            <CpslIcon icon="key" slot="start" />
            Disconnect
          </DestructiveButton>
        )}
      </>
    );
  }, [profileWallet, connectionType, disconnectStatus]);

  useEffect(() => {
    return () => {
      setProfileWallet(undefined);
    };
  }, []);

  return <Container>{Content}</Container>;
};

const Container = safeStyled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
`;

const DestructiveButton = safeStyled(CpslButton)`
  --button-destructive-hover-background-color: rgba(255, 0, 0, 0.2);
  --button-destructive-active-background-color: rgba(255, 0, 0, 0.1);
`;
