import { CpslButton, CpslInput, CpslText } from '@getpara/react-components';
import { Card, OverflowText, ProfileInnerContainer } from './common';
import { useAccount, useClient, useWallet } from '@getpara/react-sdk';
import { useState } from 'react';
import { useViemClient } from '@getpara/react-sdk/evm';
import { sepolia } from 'viem/chains';
import { http } from 'viem';

export const ParaProfile = () => {
  const { embedded, external, connectionType, isConnected } = useAccount({ cosmos: { multiChain: true } });
  const { data: wallet } = useWallet();
  const { viemClient } = useViemClient({
    walletClientConfig: {
      chain: sepolia,
      transport: http('https://ethereum-sepolia-rpc.publicnode.com'),
    },
  });
  const paraClient = useClient();

  const [message, setMessage] = useState<string>('');
  const [messageSignature, setMessageSignature] = useState<string>();

  const handleSign = async () => {
    if (!wallet || !message || !viemClient) {
      return;
    }

    const signatureRes = await viemClient.signMessage({ message });

    setMessageSignature(signatureRes);
  };

  const embeddedConnected = isConnected && embedded?.isConnected && embedded?.wallets?.some(w => !w.isExternal);
  const evmConnected = isConnected && external?.evm?.isConnected;
  const cosmosConnected = isConnected && external?.cosmos?.isConnected;
  const solanaConnected = isConnected && external?.solana?.isConnected;

  return (
    <Card>
      <ProfileInnerContainer>
        <CpslText variant="headingXS" weight="semiBold">
          Status
        </CpslText>
        <CpslText variant="bodyL" weight="semiBold">
          Connection Type: {connectionType || ''}
        </CpslText>
        <CpslText variant="bodyL" weight="semiBold">
          Embedded: {embeddedConnected ? 'Connected' : 'Not Connected'}
        </CpslText>
        <CpslText variant="bodyL" weight="semiBold">
          EVM: {evmConnected ? 'Connected' : 'Not Connected'}
        </CpslText>
        <CpslText variant="bodyL" weight="semiBold">
          Cosmos: {cosmosConnected ? 'Connected' : 'Not Connected'}
        </CpslText>
        <CpslText variant="bodyL" weight="semiBold">
          Solana: {solanaConnected ? 'Connected' : 'Not Connected'}
        </CpslText>
        <CpslText>
          Selected Wallet:{' '}
          {isConnected
            ? wallet
              ? paraClient?.getDisplayAddress(wallet.id, { truncate: true, addressType: wallet.type })
              : 'No Wallet Selected'
            : 'Not Connected'}
        </CpslText>
        {isConnected && (
          <>
            <CpslInput
              placeholder="Message to sign"
              onCpslInput={e => {
                setMessage(e.detail.value ?? '');
              }}
            />
            {messageSignature && <OverflowText>Message Signature: {messageSignature}</OverflowText>}
            <CpslButton disabled={!message} onClick={handleSign}>
              Sign Message
            </CpslButton>
          </>
        )}
        <CpslButton
          disabled={!isConnected}
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
          disabled={!isConnected}
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
