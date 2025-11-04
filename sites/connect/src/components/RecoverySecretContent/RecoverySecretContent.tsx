import { useState } from 'react';
import { BaseContainer as BaseButton } from '../base/Button/styles';
import Input from '../base/Input';

import * as Styled from './styles';
import { CircularProgress } from '@mui/material';
import { useUserStore } from '@/store/useUserStore';
import { useClient } from '@getpara/react-sdk';

export const RecoverySecretContent = () => {
  const para = useClient();
  const [isLoading, setIsLoading] = useState(false);
  const [newShare, setNewShare] = useState<string>();
  const currentWalletId = useUserStore(state => state.currentWalletId);

  const backupDecryptionKey = JSON.parse(newShare || '{}').backupDecryptionKey;

  const handleGenerateRecovery = async () => {
    if (!para) return;

    setIsLoading(true);

    const fetchedWallet = (await para.fetchWallets()).filter(wallet =>
      currentWalletId ? currentWalletId === wallet.id : !!wallet.address,
    )[0];
    const newShare = await para.distributeNewWalletShare({
      walletId: fetchedWallet.id,
      skipBiometricShareCreation: true,
      forceRefresh: true,
    });

    setNewShare(newShare);
    setIsLoading(false);
  };

  const handleShareDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([backupDecryptionKey], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'recovery.txt';
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  return (
    <>
      {isLoading ? (
        <CircularProgress color="inherit" />
      ) : (
        <>
          {newShare && (
            <Styled.SecretContainer>
              <Styled.Label>Your New Recovery Secret</Styled.Label>
              <Input
                fullAddress={backupDecryptionKey}
                walletAddress={backupDecryptionKey}
                disabled
                truncateAddress={false}
                copiedText="Secret Copied!"
              />
              <Styled.HiddenInput type="password" value={backupDecryptionKey} />
            </Styled.SecretContainer>
          )}
          <BaseButton onClick={newShare ? handleShareDownload : handleGenerateRecovery}>
            {newShare ? 'Download Recovery Secret' : 'Generate New Recovery Secret'}
          </BaseButton>
        </>
      )}
    </>
  );
};
