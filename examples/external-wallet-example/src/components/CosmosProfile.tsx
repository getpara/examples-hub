import { CpslButton, CpslInput, CpslText } from '@usecapsule/react-components';
import { ProfileInnerContainer, Card, OverflowText } from './common';
import { useState } from 'react';
import { getWallet, useAccount, useActiveWalletType } from '@usecapsule/graz';
import { useCosmosStore } from '../stores/cosmosStore/useCosmosStore';
import { useCapsuleCosmos } from '../../../../packages/cosmos-wallet-connectors/dist/providers/CapsuleCosmosContext';

export const CosmosProfile = () => {
  const { multiChain, chains } = useCapsuleCosmos();
  const selectedCosmosChainId = useCosmosStore(state => state.selectedChainId);
  const { data: account } = useAccount({ multiChain, chains });
  const { walletType } = useActiveWalletType();

  const [message, setMessage] = useState<string>('');
  const [messageSignature, setMessageSignature] = useState<string>();
  const [verified, setVerified] = useState<boolean>();

  const address = multiChain ? (account as any)?.[selectedCosmosChainId]?.bech32Address : account?.bech32Address;

  const handleSign = async () => {
    const wallet = getWallet(walletType);
    setMessageSignature(undefined);
    setVerified(undefined);

    if (!wallet.signArbitrary) {
      return;
    }

    const resp = await wallet.signArbitrary(selectedCosmosChainId, address, message);

    setMessageSignature(resp.signature);
    setMessage('');
  };

  return (
    <Card>
      <ProfileInnerContainer>
        <CpslText variant="headingXS" weight="semiBold">
          Cosmos
        </CpslText>
        <CpslText>Connected Cosmos Wallet: {address ?? 'Not Connected'}</CpslText>
        {address && (
          <>
            <CpslInput
              placeholder="Message to sign"
              onCpslInput={e => {
                setMessage(e.detail.value ?? '');
              }}
            />
            {messageSignature && <OverflowText>Message Signature: {messageSignature}</OverflowText>}
            {verified && <OverflowText>Message Verified</OverflowText>}
            <CpslButton disabled={!message} onClick={handleSign}>
              Sign Message
            </CpslButton>
          </>
        )}
      </ProfileInnerContainer>
    </Card>
  );
};
