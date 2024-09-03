import { CpslButton, CpslInput, CpslText } from '@usecapsule/react-components';
import { useWallet } from '@solana/wallet-adapter-react';
import { ProfileInnerContainer, Card, OverflowText } from './common';
import { useState } from 'react';
import { ed25519 } from '@noble/curves/ed25519';
import bs58 from 'bs58';

export const SolanaProfile = () => {
  const { publicKey, signMessage } = useWallet();

  const [message, setMessage] = useState<string>('');
  const [messageSignature, setMessageSignature] = useState<string>();
  const [verified, setVerified] = useState<boolean>();

  const address = publicKey?.toString();

  const handleSign = async () => {
    setMessageSignature(undefined);
    setVerified(false);

    if (!signMessage || !publicKey) {
      return;
    }

    const encodedMessage = new TextEncoder().encode(message);

    const res = await signMessage?.(encodedMessage);

    const decodedRes = bs58.encode(res);
    const isVerfied = ed25519.verify(res, encodedMessage, publicKey.toBytes());

    setVerified(isVerfied);
    setMessageSignature(decodedRes);
    setMessage('');
  };

  return (
    <Card>
      <ProfileInnerContainer>
        <CpslText variant="headingXS" weight="semiBold">
          Solana
        </CpslText>
        <CpslText>Connected Solana Wallet: {address ?? 'Not Connected'}</CpslText>
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
