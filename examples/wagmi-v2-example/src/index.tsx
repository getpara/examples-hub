// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useSessionStorage } from 'react-use';
import ReactDOM from 'react-dom/client';
import { Button, ChakraProvider, Container, HStack, Input, Select, Text, VStack } from '@chakra-ui/react';
import { useDebounce } from 'use-debounce';
import { parseEther } from 'viem';
import { sepolia } from 'viem/chains';
import {
  createConfig as createConfig,
  useAccount as useAccount,
  useConnect as useConnect,
  useDisconnect as useDisconnect,
  usePrepareTransactionRequest,
  useSendTransaction as useSendTransaction,
  useSignMessage as useSignMessage,
  useWaitForTransactionReceipt,
  WagmiProvider,
  http,
} from 'wagmi';
import { coinbaseWallet, walletConnect } from 'wagmi/connectors';

import Para from '@getpara/web-sdk';
import { paraConnector } from '@getpara/wagmi-v2-integration';
import ParaCore, { Environment, ConstructorOpts } from '@getpara/core-sdk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@getpara/react-sdk/styles.css';

const queryClient = new QueryClient();

// sample transaction params
const DEFAULT_TO_ADDRESS = '0x42c9a72c9dfcc92cae0de9510160cea2da27af91';
const DEFAULT_VALUE = '1000';
const API_KEY_WITH_BRANDING = '8ee2d015fbc6062a6e30bdc472f2946c';

// goerli chain id
const DEFAULT_CHAIN_ID = '11155111';

function WagmiSignMessage(): JSX.Element {
  const [message, setMessage] = useState<string>('');
  const [messageSignature, setMessageSignature] = useState<string | undefined>();
  const onSuccess = (data: string) => {
    setMessageSignature(data);
  };
  const { signMessageAsync } = useSignMessage();
  return (
    <>
      <Input
        placeholder="message to sign"
        onChange={e => {
          setMessage(e.target.value);
        }}
      />
      {messageSignature && <Text>Message Signature: {messageSignature}</Text>}
      <Button
        isDisabled={!message}
        onClick={async () => {
          await signMessageAsync({ message }, { onSuccess });
        }}
      >
        Sign Message
      </Button>
    </>
  );
}

function WagmiSendTransaction(): JSX.Element {
  const [toAddress, setToAddress] = useState(DEFAULT_TO_ADDRESS);
  const [debouncedToAddress] = useDebounce(toAddress, 500);

  const [amount, setAmount] = useState(DEFAULT_VALUE);
  const [debouncedValue] = useDebounce(amount, 500);

  const { data: config } = usePrepareTransactionRequest({
    to: debouncedToAddress,
    value: debouncedValue ? parseEther(amount, 'gwei') : undefined,
    chainId: Number(DEFAULT_CHAIN_ID),
    type: 'eip1559',
  });

  const { data: txHash, sendTransaction, isPending: isSendTxPending } = useSendTransaction();

  const { data: txReceipt, isLoading: isWaitTxLoading } = useWaitForTransactionReceipt({
    hash: txHash,
    confirmations: 0,
  });

  return (
    <>
      <Text>To Address:</Text>
      <Input
        value={toAddress}
        onChange={e => {
          setToAddress(e.target.value);
        }}
      />
      <Text>Value in gwei:</Text>
      <Input
        value={amount}
        onChange={e => {
          setAmount(e.target.value);
        }}
      />
      <Button
        isDisabled={isSendTxPending || isWaitTxLoading || !sendTransaction || !toAddress || !amount}
        onClick={() => {
          sendTransaction(config, {
            onError: e => {
              console.log('Err', e);
            },
          });
        }}
      >
        {isSendTxPending ? 'Sending Transaction...' : isWaitTxLoading ? 'Awaiting Confirmation...' : 'Send Transaction'}
      </Button>
      {txReceipt && (
        <Text>
          <a rel="noreferrer" target="_blank" href={`https://sepolia.etherscan.io/tx/${txHash}`}>
            <u>Sepolia Scan Link</u>
          </a>
        </Text>
      )}
    </>
  );
}

function WagmiProfileComponent(): JSX.Element {
  const { address, connector, isConnected } = useAccount();
  const { connect, connectors, error } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && connector) {
    return (
      <>
        <VStack backgroundColor="blue.400" padding={6}>
          <Text color="white">Address is: {address}</Text>
          <Text color="white">Connected to {connector?.name}</Text>
          <Button
            color="red.600"
            backgroundColor="white"
            onClick={() => {
              disconnect(undefined, {
                onError: e => {
                  console.log('ERR', e);
                },
              });
            }}
          >
            Disconnect
          </Button>
        </VStack>
        <WagmiSignMessage />
        <WagmiSendTransaction />
      </>
    );
  }

  return (
    <VStack backgroundColor="blue.400" padding={6}>
      {connectors.map(connector => (
        <Button
          color="purple"
          backgroundColor="white"
          disabled={!connector.ready}
          key={connector.id}
          onClick={() => connect({ connector })}
        >
          {connector.name}
        </Button>
      ))}

      {error && <Text>{error.message}</Text>}
    </VStack>
  );
}

function WagmiComponent(): JSX.Element {
  const chains = [sepolia];

  const config = createConfig({
    chains,
    transports: {
      [sepolia.id]: http(),
    },
    connectors: [
      paraConnector({
        para,
        chains,
        options: {},
        appName: 'Example',
      }),
      coinbaseWallet({ appName: 'wagmi' }),
      walletConnect({
        projectId: '2e3018ef50ea4ee9bf3683a9f0a6bd03',
      }),
    ],
  });

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <WagmiProfileComponent />
      </WagmiProvider>
    </QueryClientProvider>
  );
}

function getParaOpts(env: Environment, useDKLS: boolean): ConstructorOpts {
  switch (env) {
    case Environment.DEV:
      return {
        // useLocalFiles: true,
        offloadMPCComputationURL: useDKLS ? undefined : 'http://localhost:9009',
      };
    case Environment.SANDBOX:
      return {
        // useLocalFiles: true,
        offloadMPCComputationURL: useDKLS ? undefined : 'https://partner-mpc-computation.sandbox.getpara.com',
        // portalBackgroundColor: '#df092d',
        // portalPrimaryButtonColor: '#322e47',
        // portalTextColor: '#ffffff',
      };
    case Environment.BETA:
      return {
        offloadMPCComputationURL: useDKLS ? undefined : 'https://partner-mpc-computation.beta.getpara.com',
      };
    case Environment.PROD:
      return {
        offloadMPCComputationURL: useDKLS ? undefined : 'https://partner-mpc-computation.prod.getpara.com',
      };
    default:
      throw new Error(`invalid environment: ${env}`);
  }
}

let para: Para = undefined;

function App() {
  const [selectedEnv, setSelectedEnv] = useSessionStorage('@EXAMPLE-para/selectedEnv', Environment.SANDBOX);
  const [selectedApiKey, setSelectedApiKey] = useSessionStorage('@EXAMPLE-para/selectedApiKey', API_KEY_WITH_BRANDING);
  const [useDKLS, setUseDKLS] = useSessionStorage('@EXAMPLE-para/useDKLS', true);

  para = React.useMemo(
    () => new Para(selectedEnv, selectedApiKey, getParaOpts(selectedEnv, useDKLS)),
    [selectedEnv, useDKLS, selectedApiKey],
  );

  const [_isSessionActive, setIsSessionActive] = useState(false);

  async function checkIsSessionActive() {
    const isFullyLoggedIn = await para.isFullyLoggedIn();
    setIsSessionActive(isFullyLoggedIn);
    if (isFullyLoggedIn && para instanceof ParaCore) {
      console.log(`exported session:\n${(para as ParaCore).exportSession()}`);
    }
  }

  useEffect(() => {
    checkIsSessionActive();
  }, []);

  return (
    <ChakraProvider>
      <Container maxW="ld" padding={10}>
        <HStack paddingBottom={5}>
          <Text width={'15%'}>
            <strong>Select Environment:</strong>
          </Text>
          <Select defaultValue={selectedEnv} onChange={e => setSelectedEnv(e.target.value as Environment)}>
            <option value={Environment.DEV}>Dev</option>
            <option value={Environment.SANDBOX}>Sandbox</option>
            <option value={Environment.BETA}>Beta</option>
            <option value={Environment.PROD}>Prod</option>
          </Select>
        </HStack>
        <HStack paddingBottom={10}>
          <Text width={'15%'}>
            <strong>Set API Key:</strong>
          </Text>
          <Input
            placeholder="api key"
            onChange={e => {
              setSelectedApiKey(e.target.value);
            }}
            value={selectedApiKey || ''}
          />
        </HStack>
        <HStack paddingBottom={5}>
          <Text width={'15%'}>
            <strong>Use DKLS:</strong>
          </Text>
          <Select defaultValue={`${!!useDKLS}`} onChange={e => setUseDKLS(e.target.value === 'true')}>
            <option value={'true'}>true</option>
            <option value={'false'}>false</option>
          </Select>
        </HStack>

        <VStack align="left" spacing={5}>
          <WagmiComponent />
        </VStack>
      </Container>
    </ChakraProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
