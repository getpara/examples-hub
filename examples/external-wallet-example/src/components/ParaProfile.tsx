import { CpslButton, CpslInput, CpslText } from '@getpara/react-components';
import { Card, OverflowText, ProfileInnerContainer } from './common';
import { useAccount, useClient, useSignMessage, useWallet } from '@getpara/react-sdk';
import { useState } from 'react';

export const ParaProfile = () => {
  const { data: account } = useAccount();
  const { data: wallet } = useWallet();
  const { signMessageAsync, error } = useSignMessage();
  const paraClient = useClient();

  const [message, setMessage] = useState<string>('');
  const [messageSignature, setMessageSignature] = useState<string>();

  const handleSign = async () => {
    if (!wallet || !message) {
      return;
    }

    const signatureRes = await signMessageAsync({
      messageBase64: Buffer.from(message).toString('base64'),
    });

    if ('pendingTransactionId' in signatureRes) {
    } else {
      if (signatureRes.signature) {
        setMessageSignature(signatureRes.signature);
      }
    }
  };

  return (
    <Card>
      <ProfileInnerContainer>
        <CpslText variant="headingXS" weight="semiBold">
          Para
        </CpslText>
        <CpslText>
          Connected Para Wallet:{' '}
          {account?.isConnected
            ? wallet
              ? paraClient?.getDisplayAddress(wallet.id, { truncate: true, addressType: wallet.type })
              : 'No Wallet Selected'
            : 'Not Connected'}
        </CpslText>
        {account?.isConnected && (
          <>
            <CpslInput
              placeholder="Message to sign"
              onCpslInput={e => {
                setMessage(e.detail.value ?? '');
              }}
            />
            {messageSignature && <OverflowText>Message Signature: {messageSignature}</OverflowText>}
            {error && <OverflowText color="error">{error.message}</OverflowText>}
            <CpslButton disabled={!message} onClick={handleSign}>
              Sign Message
            </CpslButton>
          </>
        )}
        <CpslButton
          disabled={!account?.isConnected}
          onClick={async () => {
            if (paraClient) {
              const jwtResponse = await paraClient.issueJwt();
              console.log(jwtResponse);
            }
          }}
        >
          Issue JWT
        </CpslButton>
        <CpslButton
          disabled={!account?.isConnected}
          onClick={async () => {
            if (paraClient) {
              const sess = await paraClient.getVerificationToken();
              console.log(sess);
            }
          }}
        >
          Export Session
        </CpslButton>
      </ProfileInnerContainer>
    </Card>
  );
};
