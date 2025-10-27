import { CpslButton, CpslInput, CpslText } from '@getpara/react-components';
import { Card, OverflowText, ProfileInnerContainer } from './common';
import { AuthMethod, ParaCore, useAccount, useAddAuthMethod, useClient, useWallet } from '@getpara/react-sdk';
import { useEffect, useState } from 'react';
import { useViemClient } from '@getpara/react-sdk/evm';
import { useCosmjsProtoSigner } from '@getpara/react-sdk/cosmos';
import { useSolanaSigner } from '@getpara/react-sdk/solana';
import { sepolia } from 'viem/chains';
import { http } from 'viem';
import { createSolanaRpc, getUtf8Encoder } from '@solana/kit';
import bs58 from 'bs58';
import { WalletSelector } from './WalletSelector';
import { useExportPrivateKey } from '@getpara/react-sdk-lite';

const paraRpc = createSolanaRpc('https://api.testnet.solana.com');

export const ParaProfile = () => {
  const { embedded, external, connectionType, isConnected } = useAccount({ cosmos: { multiChain: true } });
  const { data: wallet } = useWallet();
  const { viemClient } = useViemClient({
    walletClientConfig: {
      chain: sepolia,
      transport: http('https://ethereum-sepolia-rpc.publicnode.com'),
    },
  });
  const { protoSigner } = useCosmjsProtoSigner();
  const { solanaSigner } = useSolanaSigner({ rpc: paraRpc });
  const paraClient = useClient();
  const { addAuthMethod } = useAddAuthMethod();
  const { mutateAsync: exportPrivateKeyAsync, isPending: isExportingPrivateKey } = useExportPrivateKey();

  const [message, setMessage] = useState<string>('');
  const [messageSignature, setMessageSignature] = useState<string>();

  useEffect(() => {
    setMessageSignature(undefined);
  }, [wallet]);

  const handleSign = async () => {
    if (!wallet || !wallet.address || !message) {
      return;
    }

    switch (wallet.type) {
      case 'EVM':
        if (!viemClient) {
          console.error('Viem client is not available');
          return;
        }

        const signatureRes = await viemClient.signMessage({ message });
        setMessageSignature(signatureRes);
        return;

      case 'COSMOS':
        if (!protoSigner) {
          console.error('Proto signer is not available');
          return;
        }

        // Create a simple sign doc for the message
        const signDoc = {
          bodyBytes: new TextEncoder().encode(
            JSON.stringify({
              messages: [],
              memo: message,
            }),
          ),
          authInfoBytes: new Uint8Array(0),
          chainId: '',
          accountNumber: BigInt(0),
        };

        const result = await protoSigner.signDirect(protoSigner.address, signDoc);

        setMessageSignature(result.signature.signature);
        return;

      case 'SOLANA':
        if (!solanaSigner) {
          console.error('Solana signer is not available');
          return;
        }

        // Convert message to bytes
        const messageBytes = new Uint8Array(getUtf8Encoder().encode(message));

        // Sign the message
        const signatureResult = await solanaSigner.signMessages([{ content: messageBytes, signatures: {} }]);

        // Get the signature
        const signatureBytes = signatureResult[0][solanaSigner.address];
        const signatureBase58 = bs58.encode(signatureBytes);

        setMessageSignature(signatureBase58);

        return;

      default:
        console.error('Unsupported wallet type');
        return;
    }
  };

  const handleAddAuthMethod = () => {
    addAuthMethod(!embedded.authMethods?.has(AuthMethod.BASIC_LOGIN) ? { authMethod: AuthMethod.BASIC_LOGIN } : undefined, {
      onError: e => console.error('Error adding auth method:', e),
    });
  };

  const handleExportPrivateKey = async () => {
    if (!wallet?.id) {
      console.error('No wallet ID available');
      return;
    }

    try {
      await exportPrivateKeyAsync({ walletId: wallet.id });
    } catch (error) {
      console.error('Error exporting private key:', error);
    }
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
        {isConnected && (
          <>
            <WalletSelector />
            <CpslInput
              placeholder="Message to sign"
              onCpslInput={(e: CustomEvent<{ value?: string }>) => {
                setMessage(e.detail.value ?? '');
              }}
            />
            {messageSignature && <OverflowText>Message Signature: {messageSignature}</OverflowText>}
            <CpslButton disabled={!message} onClick={handleSign}>
              Sign Message
            </CpslButton>
          </>
        )}
        <CpslButton disabled={!isConnected} onClick={handleAddAuthMethod}>
          {!embedded.authMethods?.has(AuthMethod.BASIC_LOGIN) ? 'Upgrade to Basic Login' : 'Add Auth Method'}
        </CpslButton>
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
        <CpslButton
          disabled={!isConnected}
          onClick={async () => {
            await paraClient?.ctx.client.deleteSelf((paraClient as ParaCore).getUserId()!);

            await paraClient?.logout();
          }}
        >
          Delete User
        </CpslButton>
        <CpslButton disabled={!isConnected || !wallet?.id || isExportingPrivateKey} onClick={handleExportPrivateKey}>
          {isExportingPrivateKey ? 'Exporting...' : 'Export Private Key'}
        </CpslButton>
      </ProfileInnerContainer>
    </Card>
  );
};
