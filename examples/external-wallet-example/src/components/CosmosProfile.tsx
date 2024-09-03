import { CpslButton, CpslInput, CpslText } from '@usecapsule/react-components';
import { useShuttle } from '@delphi-labs/shuttle-react';
import { ProfileInnerContainer, Card, OverflowText } from './common';
import { useState } from 'react';
import { useCosmosStore } from '../stores/cosmosStore/useCosmosStore';

export const CosmosProfile = () => {
  const selectedCosmosChainId = useCosmosStore(state => state.selectedChainId);
  const { getWallets, signArbitrary, verifyArbitrary } = useShuttle();
  const wallet = getWallets({ chainId: selectedCosmosChainId })[0];

  const [message, setMessage] = useState<string>('');
  const [messageSignature, setMessageSignature] = useState<string>();
  const [verified, setVerified] = useState<boolean>();

  const address = wallet?.account?.address;

  const handleSign = async () => {
    setMessageSignature(undefined);
    setVerified(undefined);

    const bytes = Buffer.from(message, 'utf-8');
    const res = await signArbitrary({
      wallet,
      data: bytes,
    });

    const verified = await verifyArbitrary({
      wallet,
      data: bytes,
      signResult: res,
    });

    setMessageSignature(res.response.signature);
    setVerified(verified);
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
