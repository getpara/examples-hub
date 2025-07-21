import { CpslButton, CpslInput, CpslText } from '@getpara/react-components';
import { useEffect, useState } from 'react';
import { useAccount, useSignMessage, useVerifyMessage } from 'wagmi';
import { Card, OverflowText, ProfileInnerContainer } from './common';
import { useWallet } from '@getpara/react-sdk';

export const EvmProfile = () => {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { data: wallet } = useWallet();

  const [message, setMessage] = useState<string>('');
  const [messageSignature, setMessageSignature] = useState<`0x${string}`>();

  const selectedAddress = wallet && wallet.type === 'EVM' ? (wallet.address as `0x${string}`) : address;

  useEffect(() => {
    if (!address && (message || messageSignature)) {
      setMessage('');
      setMessageSignature(undefined);
    }
  }, [address]);

  const verified = useVerifyMessage({
    address,
    message,
    signature: messageSignature,
  });

  const handleSign = async () => {
    setMessageSignature(undefined);

    const res = await signMessageAsync({
      message,
      account: selectedAddress,
    });

    setMessageSignature(res);
    setMessage('');
  };

  return (
    <Card>
      <ProfileInnerContainer>
        <CpslText variant="headingXS" weight="semiBold">
          EVM
        </CpslText>
        <CpslText>Connected EVM Wallet: {selectedAddress ?? 'Not Connected'}</CpslText>
        {selectedAddress && (
          <>
            <CpslInput
              placeholder="Message to sign"
              onCpslInput={e => {
                setMessage(e.detail.value ?? '');
              }}
            />
            {messageSignature && <OverflowText>Message Signature: {messageSignature}</OverflowText>}
            {messageSignature && verified && <OverflowText>Message Verified</OverflowText>}
            <CpslButton disabled={!message} onClick={handleSign}>
              Sign Message
            </CpslButton>
          </>
        )}
      </ProfileInnerContainer>
    </Card>
  );
};
