// @ts-nocheck
import React, { useCallback, useEffect, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import ReactDOM from 'react-dom/client';
import { Box, Button, ChakraProvider, Checkbox, Container, HStack, Input, Select, Text, VStack } from '@chakra-ui/react';
import { useDebounce } from 'use-debounce';
import Web3 from 'web3';
import { http, parseEther } from 'viem';
import { sepolia } from 'viem/chains';
import { SigningStargateClient } from '@cosmjs/stargate';
import { ethers } from 'ethers';
import {
  configureChains,
  createConfig,
  useAccount,
  useConnect,
  useDisconnect,
  usePrepareSendTransaction,
  useSendTransaction,
  useSignMessage,
  useWaitForTransaction,
  WagmiConfig,
} from 'wagmi';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import * as solana from '@solana/web3.js';
import Capsule from '@usecapsule/web-sdk';
import { CapsuleModal, OAuthMethod, ModalStep, ModalStepProp, ExternalWallet } from '@usecapsule/react-sdk';
import { FeeMarketEIP1559Transaction } from '@ethereumjs/tx';
import { CapsuleProtoSigner } from '@usecapsule/cosmjs-v0-integration';
import { CapsuleEthersSigner } from '@usecapsule/ethers-v6-integration';
import { createCapsuleViemClient } from '@usecapsule/viem-v1-integration';
import { CapsuleConnector, CapsuleEIP1193Provider } from '@usecapsule/wagmi-v1-integration';
import CoreCapsule, {
  Environment,
  ConstructorOpts,
  getBaseUrl,
  WalletType,
  TPregenIdentifierType,
  PREGEN_IDENTIFIER_TYPES,
  TransactionReviewDenied,
  TransactionReviewTimeout,
} from '@usecapsule/core-sdk';
import { CapsuleSolanaWeb3Signer } from '@usecapsule/solana-web3.js-v1-integration';
import { FONT_OPTIONS } from './constants';
import '@usecapsule/react-sdk/styles.css';
import { ArrayField } from './array';
import { OfframpSend } from './offramp';
import { ToastContainer } from 'react-toastify';

interface Partner {
  apiKey: string;
  id: string;
  name: string;
  displayName: string;
}

// sample transaction params
const DEFAULT_TO_ADDRESS = '0x42c9a72c9dfcc92cae0de9510160cea2da27af91';
const DEFAULT_VALUE = '1000';
const DEFAULT_GAS_AMOUNT = '21000';
const DEFAULT_MAX_PRIORITY_FEE_PER_GAS = '1';
const DEFAULT_MAX_FEE_PER_GAS = '3';
const DEFAULT_NONCE = '0';
const API_KEY_WITH_BRANDING = '8ee2d015fbc6062a6e30bdc472f2946c';

const ALCHEMY_SEPOLIA_PROVIDER = 'https://eth-sepolia.g.alchemy.com/v2/KfxK8ZFXw9mTUuJ7jt751xGJCa3r8noZ';
const DEFAULT_CHAIN_ID = '11155111';
const DEFAULT_CONTRACT_ABI = [
  {
    inputs: [],
    name: 'retrieve',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'num',
        type: 'uint256',
      },
    ],
    name: 'store',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
const DEFAULT_SMART_CONTRACT_FUNCTION = 'store';
const DEFAULT_SMART_CONTRACT_ARGS = ['808'];
const COSMOS_TESTNET_RPC = 'wss://rpc.sentry-01.theta-testnet.polypore.xyz';
const COSMOS_DEFAULT_TO_ADDRESS = 'cosmos1f3px9t4juk43cwufj7f9s64z3wj7xvyc0rexg6';
const web3 = new Web3();

const THEMES = {
  devRed: ['www.red.com', 'https://i.imgur.com/7joBw13.png', false, '#ffffff', '#ff2222', 'none', 'dark'],
  devBlue: ['www.blue.com', 'https://i.imgur.com/rIqjbim.png', true, '#222222', '#33bbff', 'lg', 'branded'],
  devGreen: ['www.green.com', 'https://i.imgur.com/xQOZmn6.png', true, '#161616', '#2fdd86', 'sm', 'branded'],
};

const PLACEHOLDERS = {
  EMAIL: 'email@website.com',
  PHONE: '+10000000000',
  CUSTOM_ID: 'custom-id',
  DISCORD: 'discord_username',
  TWITTER: 'twitter_username',
};

// use below to call "view" smart contract function
// const web3 = new Web3('https://eth-sepolia.g.alchemy.com/v2/demo');
// use below to deploy smart contract associated with default abi
// const DEFAULT_DEPLOY_CONTRACT_BYTECODE = '0x608060405234801561001057600080fd5b50610150806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80632e64cec11461003b5780636057361d14610059575b600080fd5b610043610075565b60405161005091906100a1565b60405180910390f35b610073600480360381019061006e91906100ed565b61007e565b005b60008054905090565b8060008190555050565b6000819050919050565b61009b81610088565b82525050565b60006020820190506100b66000830184610092565b92915050565b600080fd5b6100ca81610088565b81146100d557600080fd5b50565b6000813590506100e7816100c1565b92915050565b600060208284031215610103576101026100bc565b5b6000610111848285016100d8565b9150509291505056fea2646970667358221220322c78243e61b783558509c9cc22cb8493dde6925aa5e89a08cdf6e22f279ef164736f6c63430008120033';
// below is address of existing smart contract on sepolia
// const DEFAULT_CONTRACT_ADDRESS = '0xc08c00e1aa97a18583dc1a72a7e9fb9ce56cfef5'

async function sendCosmosTx(capsule: Capsule): Promise<void> {
  const protoSigner = new CapsuleProtoSigner(capsule);
  const client = await SigningStargateClient.connectWithSigner(COSMOS_TESTNET_RPC, protoSigner);

  console.log(await client.getAccount(protoSigner.address));
  console.log(await client.getAllBalances(protoSigner.address));
  const fromAddress = protoSigner.address;

  try {
    await client.sendTokens(
      fromAddress,
      COSMOS_DEFAULT_TO_ADDRESS,
      [
        {
          denom: 'uatom',
          amount: '808',
        },
      ],
      {
        amount: [
          {
            amount: '1000',
            denom: 'uatom',
          },
        ],
        gas: '200000',
      },
    );
  } catch (error) {
    if (error instanceof TransactionReviewDenied) {
      console.log('Transaction review has been denied by the user');
    }

    if (error instanceof TransactionReviewTimeout) {
      console.log('Transaction review has timed out');
    }

    console.error(error);
  }
}

const SOLANA_RECIPIENT_PUBLIC_KEY = '4TUYF5Q6sCkBCjamQrTkNYJyxhyaCPiPnq9oVg6qXbTp';
const SOLANA_DEVNET_RPC_ENDPOINT = 'https://api.devnet.solana.com';

async function sendSolanaTx(capsule: Capsule, walletId: string, setSig: any): Promise<void> {
  try {
    const connection = new solana.Connection(SOLANA_DEVNET_RPC_ENDPOINT, 'confirmed');
    const solanaSigner = new CapsuleSolanaWeb3Signer(capsule, connection, walletId);
    const tx = new solana.Transaction().add(
      solana.SystemProgram.transfer({
        fromPubkey: solanaSigner.sender,
        toPubkey: new solana.PublicKey(SOLANA_RECIPIENT_PUBLIC_KEY),
        lamports: 0.03003 * solana.LAMPORTS_PER_SOL, // Convert SOL to lamports
      }),
    );
    tx.feePayer = solanaSigner.sender;

    console.log(`${solanaSigner.address} has balance ${await connection.getBalance(solanaSigner.sender)}`);
    console.log(`most recent block: ${await connection.getSlot()}`);

    let rawTxRes;
    try {
      rawTxRes = await solanaSigner.sendTransaction(tx, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
    } catch (error: TransactionReviewError) {
      console.error(error);
    }

    console.log(`solana signature: ${rawTxRes}`);
    setSig(rawTxRes);
  } catch (e) {
    console.error(e);
  }
}

async function _sendViemTransaction(nonce = 0): Promise<void> {
  const viemClient = createCapsuleViemClient(capsule, {
    chain: sepolia,
    transport: http(ALCHEMY_SEPOLIA_PROVIDER),
  });
  console.log(
    await viemClient.sendTransaction({
      value: BigInt(10100000000),
      to: DEFAULT_TO_ADDRESS,
      chain: sepolia,
      gas: BigInt(21000),
      maxPriorityFeePerGas: BigInt(1000000000),
      maxFeePerGas: BigInt(3000000000),
      account: viemClient.account,
      nonce,
    }),
  );
}

async function _sendEIP1193ProviderTransaction(): Promise<void> {
  const eip1193Provider = new CapsuleEIP1193Provider({
    capsule,
    chainId: DEFAULT_CHAIN_ID,
    chains: [sepolia],
    appName: 'Example',
  });
  const accounts = await eip1193Provider.request({
    method: 'eth_accounts',
    params: undefined,
  });
  console.log(accounts);
  const tx = {
    value: BigInt(190000000000),
    to: DEFAULT_TO_ADDRESS,
    chain: sepolia,
    gas: BigInt(21000),
    maxPriorityFeePerGas: BigInt(1100000000),
    maxFeePerGas: BigInt(3000000000),
    account: accounts[0],
    nonce: 0,
    type: 'eip1559',
  };
  console.log(
    await eip1193Provider.request({
      method: 'eth_sendTransaction',
      params: [tx],
    }),
  );
}

function WagmiSignMessage(): JSX.Element {
  const [message, setMessage] = useState<string>('');
  const [messageSignature, setMessageSignature] = useState<string | undefined>();
  const onSuccess = (data: string) => {
    setMessageSignature(data);
  };
  const { signMessageAsync } = useSignMessage({ onSuccess });
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
          try {
            await signMessageAsync({ message });
          } catch (error) {
            console.error(error);
          }
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

  const { config } = usePrepareSendTransaction({
    to: debouncedToAddress,
    value: debouncedValue ? parseEther(amount, 'gwei') : undefined,
    chainId: Number(DEFAULT_CHAIN_ID),
    type: 'eip1559',
  });

  const { data, sendTransaction, isLoading: isSendTxLoading } = useSendTransaction(config);

  const { isLoading: isWaitTxLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
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
        isDisabled={isSendTxLoading || isWaitTxLoading || !sendTransaction || !toAddress || !amount}
        onClick={() => {
          sendTransaction();
        }}
      >
        {isSendTxLoading ? 'Sending Transaction...' : isWaitTxLoading ? 'Awaiting Confirmation...' : 'Send Transaction'}
      </Button>
      {isSuccess && (
        <Text>
          <a rel="noreferrer" target="_blank" href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>
            <u>Sepolia Scan Link</u>
          </a>
        </Text>
      )}
    </>
  );
}

function WagmiProfileComponent(): JSX.Element {
  const { address, connector, isConnected } = useAccount();
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <>
        <VStack backgroundColor="blue.400" padding={6}>
          <Text color="white">Address is: {address}</Text>
          <Text color="white">Connected to {connector?.name}</Text>
          <Button
            color="red.600"
            backgroundColor="white"
            onClick={() => {
              disconnect();
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
          {!connector.ready && ' (unsupported)'}
          {isLoading && connector.id === pendingConnector?.id && ' (connecting)'}
        </Button>
      ))}

      {error && <Text>{error.message}</Text>}
    </VStack>
  );
}

function WagmiComponent({ capsule }: { capsule: Capsule }): JSX.Element {
  const { chains, publicClient, webSocketPublicClient } = configureChains(
    [sepolia],
    [alchemyProvider({ apiKey: 'HfT9dMNs3W0h1vJmiPZQ_APaFjPo-BF9' })],
  );
  const config = createConfig({
    autoConnect: true,
    connectors: [
      new CapsuleConnector({
        capsule,
        chains,
        options: {},
        appName: 'Example',
      }),
      new MetaMaskConnector({ chains }),
      new CoinbaseWalletConnector({
        chains,
        options: {
          appName: 'wagmi',
        },
      }),
      new WalletConnectConnector({
        chains,
        options: {
          projectId: '2e3018ef50ea4ee9bf3683a9f0a6bd03',
        },
      }),
    ],
    publicClient,
    webSocketPublicClient,
  });

  return (
    <WagmiConfig config={config}>
      <WagmiProfileComponent />
    </WagmiConfig>
  );
}

async function sendEthersTransaction(capsule: Capsule, tx: any): Promise<void> {
  console.log('sending ethers tx:\n', tx);
  const currentWalletId = capsule?.currentWalletIds?.EVM?.[0];
  if (!currentWalletId) {
    return;
  }

  const provider = new ethers.EtherscanProvider(Number(tx.chainId), 'KfxK8ZFXw9mTUuJ7jt751xGJCa3r8noZ');
  const ethersSigner = new CapsuleEthersSigner(capsule, provider, currentWalletId);
  let res;
  try {
    res = await ethersSigner.sendTransaction(tx);
  } catch (error) {
    console.log(error);
  }
  console.log('send ethers tx response:\n', res);
}

async function sendEthersMintNFTTransaction(capsule: Capsule, tx: any): Promise<void> {
  console.log('sending ethers tx:\n', tx);
  const currentWalletId = capsule?.currentWalletIds?.EVM?.[0];
  if (!currentWalletId) {
    return;
  }
  const provider = new ethers.JsonRpcProvider(INFURA_HOST, 'sepolia');

  const ethersSigner = new CapsuleEthersSigner(capsule, provider, currentWalletId);
  let res;
  try {
    res = await ethersSigner.sendTransaction(tx);
  } catch (error) {
    console.error(error);
  }
  console.log('send ethers tx response:\n', res);
}

async function _createTransaction(
  toAddress: string,
  value: string,
  gasAmount: string,
  maxPriorityFeePerGas: string,
  maxFeePerGas: string,
  nonce: string,
  chainId: string,
  contractAbi: string,
  functionName: string,
  functionArgs: string[],
  deployByteCode: string,
): Promise<string> {
  let functionCallData: any;
  if (functionName && contractAbi) {
    const contract = new web3.eth.Contract(JSON.parse(contractAbi), toAddress);
    functionCallData = contract.methods[functionName](...functionArgs).encodeABI();
  }
  console.log('1');
  const tx = new FeeMarketEIP1559Transaction({
    to: !deployByteCode ? toAddress : undefined,
    value: value ? web3.utils.toHex(web3.utils.toWei(value, 'gwei')) : undefined,
    gasLimit: web3.utils.toHex(Number(gasAmount)),
    maxPriorityFeePerGas: web3.utils.toHex(web3.utils.toWei(maxPriorityFeePerGas, 'gwei')),
    maxFeePerGas: web3.utils.toHex(web3.utils.toWei(maxFeePerGas, 'gwei')),
    nonce: web3.utils.toHex(Number(nonce)),
    data: functionCallData || deployByteCode || undefined,
    chainId: web3.utils.toHex(chainId),
    type: '0x02',
  });
  console.log('2');
  return tx.serialize().toString('base64');
}

function getCapsuleOpts(env: Environment, useDKLS: boolean): ConstructorOpts {
  switch (env) {
    case Environment.DEV:
      return {
        // useLocalFiles: true,
        offloadMPCComputationURL: useDKLS ? undefined : 'http://localhost:9009',
      };
    case Environment.SANDBOX:
      return {
        // useLocalFiles: true,
        offloadMPCComputationURL: useDKLS ? undefined : 'https://partner-mpc-computation.sandbox.usecapsule.com',
        // portalBackgroundColor: '#df092d',
        // portalPrimaryButtonColor: '#322e47',
        // portalTextColor: '#ffffff',
      };
    case Environment.BETA:
      return {
        offloadMPCComputationURL: useDKLS ? undefined : 'https://partner-mpc-computation.beta.usecapsule.com',
      };
    case Environment.PROD:
      return {
        offloadMPCComputationURL: useDKLS ? undefined : 'https://partner-mpc-computation.prod.usecapsule.com',
      };
    default:
      throw new Error(`invalid environment: ${env}`);
  }
}

function App() {
  const [selectedView, setSelectedView] = useLocalStorage('@EXAMPLE-CAPSULE/selectedView', 'OLD_VIEW');
  const [selectedEnv, setSelectedEnv] = useLocalStorage('@EXAMPLE-CAPSULE/selectedEnv', Environment.SANDBOX);
  const [selectedApiKey, setSelectedApiKey] = useLocalStorage('@EXAMPLE-CAPSULE/selectedApiKey', API_KEY_WITH_BRANDING);
  const [useDKLS, setUseDKLS] = useLocalStorage('@EXAMPLE-CAPSULE/useDKLS', true);
  const [partners, setPartners] = useLocalStorage<Partner[]>('@EXAMPLE-CAPSULE/partners', []);
  const [homepageUrl, setHomepageUrl] = useLocalStorage('@EXAMPLE-CAPSULE/homepageUrl', 'www.capsule.com');

  const [logo, setLogo] = useLocalStorage('@EXAMPLE-CAPSULE/logo', '');
  const [useTheme, setUseTheme] = useLocalStorage('@EXAMPLE-CAPSULE/useTheme', false);
  const [isDarkTheme, setIsDarkTheme] = useLocalStorage('@EXAMPLE-CAPSULE/useTheme', false);
  const [foregroundColor, setForegroundColor] = useLocalStorage('@EXAMPLE-CAPSULE/foregroundColor', '#FAFAFA');
  const [backgroundColor, setBackgroundColor] = useLocalStorage('@EXAMPLE-CAPSULE/backgroundColor', '#121212');
  const [borderRadius, setBorderRadius] = useLocalStorage('@EXAMPLE-CAPSULE/borderRadius', 'sm');
  const [font, setFont] = useLocalStorage('@EXAMPLE-CAPSULE/font', 'inter');
  const [logoVariant, setLogoVariant] = useLocalStorage('@EXAMPLE-CAPSULE/logoVariant', 'branded');

  const [externalWallets, setExternalWallets] = useLocalStorage('@EXAMPLE-CAPSULE/externalWallets', []);
  const [onRampTestMode, setOnRampTestMode] = useLocalStorage('@EXAMPLE-CAPSULE/onRampTestMode', true);
  const [hideWallets, setHideWallets] = useLocalStorage('@EXAMPLE-CAPSULE/hideWallets', false);

  const [pregenIdentifier, setPregenIdentifier] = useState('');
  const [pregenIdentifierType, setPregenIdentifierType] = useState<TPregenIdentifierType>('EMAIL');
  const [pregenWalletType, setPregenWalletType] = useLocalStorage<WalletType | 'missing'>(
    '@EXAMPLE-CAPSULE/pregenWalletType',
    'missing',
  );

  const [updatePregenIdentifier, setUpdatePregenIdentifier] = useState('');
  const [updatePregenIdentifierType, setUpdatePregenIdentifierType] = useState<TPregenIdentifierType>('EMAIL');

  const [pregenUserShare, setPregenUserShare] = useLocalStorage<string>('@EXAMPLE-CAPSULE/pregenUserShare', '');
  const [deletedEmail, setDeletedEmail] = useState('');
  const [emailPendingDeletion, setEmailPendingDeletion] = useState('');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [txToAddress, setTxToAddress] = useState(DEFAULT_TO_ADDRESS);
  const [txValue, setTxValue] = useState(DEFAULT_VALUE);
  const [txGasAmount, setTxGasAmount] = useState(DEFAULT_GAS_AMOUNT);
  const [txMaxPriorityFeePerGas, setTxMaxPriorityFeePerGas] = useState(DEFAULT_MAX_PRIORITY_FEE_PER_GAS);
  const [txMaxFeePerGas, setTxMaxFeePerGas] = useState(DEFAULT_MAX_FEE_PER_GAS);
  const [nonce, setNonce] = useState(DEFAULT_NONCE);
  const [chainId, setChainId] = useState(DEFAULT_CHAIN_ID);
  const [smartContractFunctionName, setSmartContractFunctionName] = useState('');
  const [smartContractFunctionArgs, setSmartContractFunctionArgs] = useState('');
  const [smartContractAbi, setSmartContractAbi] = useState(JSON.stringify(DEFAULT_CONTRACT_ABI));
  const [smartContractByteCode, setSmartContractByteCode] = useState('');
  const [_capsuleKey, setCapsuleKey] = useState(0);
  const [deleteButtonDisabled, setDeleteButtonDisabled] = useState(false);
  const [secondsToDelete, setSecondsToDelete] = useState(4);
  const [messageToSign, setMessageToSign] = useState('');
  const [ethersSignature, setEthersSignature] = useState('');
  const [solanaSignature, setSolanaSignature] = useState('');

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentStepOverride, setCurrentStepOverride] = useState<ModalStepProp | undefined>(undefined);

  const [capsule, setCapsule] = useState<Capsule | undefined>();
  const [capsuleError, setCapsuleError] = useState<Error | undefined>();

  useEffect(() => {
    async function create() {
      try {
        const _capsule = new Capsule(selectedEnv, selectedApiKey, {
          ...getCapsuleOpts(selectedEnv, useDKLS),
          homepageUrl,
          xUrl: 'https://twitter.com/usecapsule',
          linkedinUrl: 'https://www.linkedin.com/company/usecapsule',
          supportUrl: 'mailto:support@usecapsule.com',
          portalTheme: useTheme ? { backgroundColor, foregroundColor } : undefined,
        });
        _capsule.ctx.isE2E = process?.env?.REACT_APP_IS_E2E === 'true';
        await _capsule.touchSession();
        setCapsuleError(undefined);
        return _capsule;
      } catch (e) {
        console.error(e);

        setCapsuleError(e);
        throw new Error(e);
      }
    }

    create().then(setCapsule);
  }, [selectedEnv, useDKLS, selectedApiKey, foregroundColor, backgroundColor, useTheme, homepageUrl]);

  const isMultiWallet = Object.values(capsule?.supportedWalletTypes ?? []).length > 1;

  const [[walletType, walletId, isPregen], setWallet] = useState<[WalletType | undefined, string | undefined]>(
    (() => {
      try {
        if (capsule) {
          const walletId = capsule?.findWalletId();
          return [capsule.wallets[walletId]?.type, walletId, !!capsule.wallets[walletId]?.pregenIdentifier];
        }
        return [undefined, undefined, false];
      } catch (e) {
        return [undefined, undefined, false];
      }
    })(),
  );

  const [, setCapsuleToString] = useState(capsule?.toString());

  function updateToString() {
    setCapsuleToString(capsule?.toString());
  }

  useEffect(() => {
    updateToString();
  }, [capsule?.supportedWalletTypes, capsule?.cosmosPrefix]);

  async function checkIsSessionActive() {
    const isFullyLoggedIn = await capsule?.isSessionActive();
    setIsSessionActive(isFullyLoggedIn);
    if (isFullyLoggedIn && capsule instanceof CoreCapsule) {
      console.log(`exported session:\n${(capsule as CoreCapsule).exportSession()}`);
    }

    const [email, phone] = [capsule?.getEmail(), capsule?.getPhoneNumber()];

    pregenIdentifierType === 'EMAIL' && !!email && setPregenIdentifier(email);
    pregenIdentifierType === 'PHONE' && !!phone && setPregenIdentifier(phone);
  }

  useEffect(() => {
    checkIsSessionActive();
  }, [capsule]);

  useEffect(() => {
    async function fetchPartners() {
      return fetch(`${getBaseUrl(selectedEnv)}partners`);
    }

    if ([Environment.DEV, Environment.SANDBOX].includes(selectedEnv)) {
      fetchPartners()
        .then(res => res.json())
        .then(json => {
          setPartners(json);
          if (!selectedApiKey) setSelectedApiKey(json[0].apiKey);
        })
        .catch(console.error);
    }
  }, [selectedEnv]);

  useEffect(() => {
    if (partners) {
      const partner = partners.find(({ apiKey }) => selectedApiKey === apiKey);
      if (partner && Object.keys(THEMES).includes(partner.name)) {
        const [
          themeHomepageUrl,
          themeModalLogo,
          themeIsDark,
          themeBackgroundColor,
          themeForegroundColor,
          themeBorderRadius,
          themeLogoVariant,
        ] = THEMES[partner.name];
        setUseTheme(true);
        setLogo(themeModalLogo);
        setHomepageUrl(themeHomepageUrl);
        setIsDarkTheme(themeIsDark);
        setForegroundColor(themeForegroundColor);
        setBackgroundColor(themeBackgroundColor);
        setBorderRadius(themeBorderRadius);
        setLogoVariant(themeLogoVariant);
      } else {
        setUseTheme(false);
      }
    }
  }, [selectedApiKey, partners]);

  const handleOnClose = async () => {
    setModalIsOpen(false);
    await checkIsSessionActive();
  };

  const handleDeleteClick = async () => {
    setDeleteButtonDisabled(true);
    if (!(await capsule?.isFullyLoggedIn())) {
      throw new Error('Need to be fully loggedIn to delete user.');
    }
    const res = await capsule?.ctx.capsuleClient.deleteSelf((capsule as CoreCapsule).getUserId());

    await capsule?.logout();

    const userEmail = res.data.email;
    setEmailPendingDeletion(userEmail);

    for (let i = secondsToDelete; i > 0; i--) {
      setTimeout(
        () => {
          setSecondsToDelete(i - 1);
          if (i - 1 === 0) {
            setCapsuleKey(prevKey => prevKey + 1);
            setIsSessionActive(false);
            setDeletedEmail('');
            setDeleteButtonDisabled(false);
            setSecondsToDelete(4);
          }
        },
        (secondsToDelete - i) * 1000,
      );
    }

    setTimeout(() => {
      setDeletedEmail(emailPendingDeletion);
      setEmailPendingDeletion('');
    }, secondsToDelete * 1000);
  };

  const handleSignMessage = useCallback(async () => {
    console.log('handle sign message');
    try {
      const provider = new ethers.JsonRpcProvider(ALCHEMY_SEPOLIA_PROVIDER, 'sepolia');
      const ethersSigner = new CapsuleEthersSigner(capsule, provider, capsule?.findWalletId(walletId, { type: ['EVM'] }));
      console.log('signing message..');
      const messageSignature = await ethersSigner.signMessage(messageToSign);
      console.log('message signature:', messageSignature);
      setEthersSignature(messageSignature);
    } catch (error) {
      console.error(error);
    }
  }, [capsule, messageToSign, walletId]);

  useEffect(() => {
    if (walletId && !capsule?.wallets[walletId]) {
      setWallet([undefined, undefined]);
    }

    if (!walletId || !capsule?.wallets[walletId]) {
      let wallet;
      try {
        wallet = capsule?.findWallet();
      } catch (e) {
        console.error(e);
      } finally {
        wallet && setWallet([wallet.type, wallet.id]);
      }
    }
  }, [walletId, capsule?.currentWalletIds, capsule?.wallets]);

  const [isEvm, isSolana] = [
    !!walletId && capsule?.wallets[walletId]?.scheme !== 'ED25519',
    !!walletId && capsule?.wallets[walletId]?.scheme === 'ED25519',
  ];

  return (
    <>
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
          <HStack paddingBottom={5}>
            <Text width={'15%'}>
              <strong>Select Example View:</strong>
            </Text>
            <Select defaultValue={selectedView} onChange={e => setSelectedView(e.target.value)}>
              <option value="OLD_VIEW">Old View</option>
              {/* <option value="ETHERS">Ethers</option>
            <option value="VIEM">Viem</option> */}
              <option value="WAGMI">Wagmi View</option>
            </Select>
          </HStack>
          {[Environment.DEV, Environment.SANDBOX].includes(selectedEnv) ? (
            <HStack paddingBottom={10}>
              <Text width={'15%'}>
                <strong>Set Partner:</strong>
              </Text>
              <Select value={selectedApiKey} onChange={e => setSelectedApiKey(e.target.value)}>
                {(partners || []).map(partner => (
                  <option key={partner.id} value={partner.apiKey}>
                    {partner.displayName} ({partner.apiKey})
                  </option>
                ))}
              </Select>
            </HStack>
          ) : (
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
          )}
          <HStack paddingBottom={10}>
            <Text width={'15%'}>
              <strong>Set Homepage URL:</strong>
            </Text>
            <Input
              placeholder="api key"
              onChange={e => {
                setHomepageUrl(e.target.value);
              }}
              value={homepageUrl || ''}
            />
          </HStack>
          <HStack paddingBottom={10}>
            <Text width={'15%'}>
              <strong>Use DKLS:</strong>
            </Text>
            <Select defaultValue={`${!!useDKLS}`} onChange={e => setUseDKLS(e.target.value === 'true')}>
              <option value={'true'}>true</option>
              <option value={'false'}>false</option>
            </Select>
          </HStack>
          {selectedView === 'WAGMI' && (
            <VStack align="left" spacing={5}>
              <WagmiComponent capsule={capsule} />
            </VStack>
          )}
          {selectedView === 'OLD_VIEW' && (
            <VStack align="left" spacing={5}>
              <HStack>
                <Text width={'15%'}>
                  <strong>Set Modal Logo:</strong>
                </Text>
                <Input
                  placeholder="Modal logo"
                  onChange={e => {
                    setLogo(e.target.value);
                  }}
                  value={logo || ''}
                />
              </HStack>
              <HStack>
                <Text width={'15%'}>
                  <strong>Custom Theme:</strong>
                </Text>
                <Checkbox isChecked={useTheme} onChange={e => setUseTheme(e.currentTarget.checked)} />
              </HStack>
              <VStack align="left" ml="40px" opacity={useTheme ? 1 : 0.8}>
                <HStack>
                  <Text width={'15%'}>
                    <strong>Dark Theme:</strong>
                  </Text>
                  <Checkbox isChecked={isDarkTheme} onChange={e => setIsDarkTheme(e.currentTarget.checked)} />
                </HStack>

                <HStack>
                  <Text width={'15%'}>
                    <strong>Set Modal Foreground:</strong>
                  </Text>
                  <Input
                    placeholder="Modal foreground"
                    disabled={!useTheme}
                    onChange={e => {
                      setForegroundColor(e.target.value);
                    }}
                    value={foregroundColor}
                  />
                </HStack>
                <HStack>
                  <Text width={'15%'}>
                    <strong>Set Modal Background:</strong>
                  </Text>
                  <Input
                    placeholder="Modal background"
                    disabled={!useTheme}
                    onChange={e => {
                      setBackgroundColor(e.target.value);
                    }}
                    value={backgroundColor}
                  />
                </HStack>
                <HStack>
                  <Text width={'15%'}>
                    <strong>Select Border Radius:</strong>
                  </Text>
                  <Select
                    disabled={!useTheme}
                    value={borderRadius}
                    onChange={e => setBorderRadius(e.target.value as Environment)}
                  >
                    <option value="none">None</option>
                    <option value="xs">XSmall</option>
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                    <option value="full">Full</option>
                  </Select>
                </HStack>
                <HStack>
                  <Text width={'15%'}>
                    <strong>Select Font:</strong>
                  </Text>
                  <Select disabled={!useTheme} defaultValue={font} onChange={e => setFont(e.target.value)}>
                    {FONT_OPTIONS.map(font => (
                      <option value={font}>{font === 'Inter' ? 'Inter (Capsule Default)' : font.replaceAll("'", '')}</option>
                    ))}
                  </Select>
                </HStack>
                <HStack>
                  <Text width={'15%'}>
                    <strong>OAuth Logo Variant:</strong>
                  </Text>
                  <Select disabled={!useTheme} value={logoVariant} onChange={e => setLogoVariant(e.target.value)}>
                    <option value="branded">Branded</option>
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </Select>
                </HStack>
              </VStack>
              <HStack>
                <Text width={'15%'}>
                  <strong>External Wallets:</strong>
                </Text>
                <ArrayField<ExternalWallet>
                  value={externalWallets}
                  onChange={setExternalWallets}
                  rowTitle={id => id}
                  remaining={Object.keys(ExternalWallet)}
                />
              </HStack>
              <HStack>
                <Text width={'15%'}>
                  <strong>On-Ramp Test Mode:</strong>
                </Text>
                <Checkbox isChecked={onRampTestMode} onChange={e => setOnRampTestMode(e.currentTarget.checked)} />
              </HStack>
              <HStack>
                <Text width={'15%'}>
                  <strong>Hide Wallets:</strong>
                </Text>
                <Checkbox isChecked={hideWallets} onChange={e => setHideWallets(e.currentTarget.checked)} />
              </HStack>

              <HStack>
                <Text width={'15%'}>
                  <strong>Current Step:</strong>
                </Text>
                <Checkbox
                  isChecked={!!currentStepOverride}
                  onChange={e => setCurrentStepOverride(e.currentTarget.checked ? 'SIGN_UP' : undefined)}
                />
                <Select
                  isDisabled={!currentStepOverride}
                  value={currentStepOverride}
                  onChange={e => setCurrentStepOverride(e.target.value)}
                >
                  {Object.keys(ModalStep).map(step => (
                    <option key={step} value={step}>
                      {step}
                    </option>
                  ))}
                </Select>
              </HStack>
              <HStack>
                <Button
                  colorScheme="green"
                  isDisabled={!capsule}
                  onClick={() => {
                    setModalIsOpen(true);
                  }}
                >
                  Open Modal
                </Button>
                {isSessionActive && (
                  <>
                    <Button
                      colorScheme="green"
                      onClick={async () => {
                        await capsule?.logout(true);
                        setIsSessionActive(false);
                      }}
                    >
                      Log Out
                    </Button>
                    <Button colorScheme="red" variant="solid" disabled={deleteButtonDisabled} onClick={handleDeleteClick}>
                      Delete User
                    </Button>
                    {!deletedEmail && secondsToDelete > 0 && deleteButtonDisabled && emailPendingDeletion && (
                      <Text>
                        {emailPendingDeletion} will be deleted in {secondsToDelete}...
                      </Text>
                    )}
                  </>
                )}
              </HStack>
              <HStack alignItems="flex-start">
                <VStack w={{ base: '100%', md: '500px' }} align="left">
                  <>
                    <Button
                      colorScheme="teal"
                      onClick={async () => {
                        const newShare = await capsule?.distributeNewWalletShare(
                          capsule?.findWalletId(walletId),
                          undefined,
                          true,
                        );

                        const backupDecryptionKey = JSON.parse(newShare || '{}').backupDecryptionKey;

                        window.alert(`New Recovery Share!! ${backupDecryptionKey}`);
                      }}
                    >
                      Regen Recovery
                    </Button>
                    <HStack>
                      <select value={pregenIdentifierType} onChange={e => setPregenIdentifierType(e.currentTarget.value)}>
                        {PREGEN_IDENTIFIER_TYPES.map(type => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <Input
                        placeholder={PLACEHOLDERS[pregenIdentifierType]}
                        onChange={e => {
                          setPregenIdentifier(e.target.value);
                        }}
                        value={pregenIdentifier}
                      />
                      <select value={pregenWalletType} onChange={e => setPregenWalletType(e.currentTarget.value)}>
                        <option key="missing" value="missing">
                          MISSING
                        </option>
                        {capsule?.supportedWalletTypes.map(({ type }) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </HStack>
                    <Button
                      colorScheme="teal"
                      onClick={async () => {
                        await capsule?.createPregenWalletPerType(
                          pregenIdentifier,
                          pregenIdentifierType,
                          pregenWalletType === 'missing' ? undefined : [pregenWalletType],
                        );

                        updateToString();
                      }}
                    >
                      Create Pregen Wallet{isMultiWallet && pregenWalletType === 'missing' ? 's' : ''}
                    </Button>
                    <HStack>
                      <Text whiteSpace="nowrap">Stored User Share:</Text>
                      <Box
                        flexGrow={1}
                        whiteSpace={'nowrap'}
                        overflow={'hidden'}
                        textOverflow={'ellipsis'}
                        fontWeight={'bold'}
                      >
                        {pregenUserShare || 'none'}
                      </Box>
                    </HStack>
                    <HStack w="100%">
                      <Button
                        flex={1}
                        colorScheme="teal"
                        onClick={() => {
                          setPregenUserShare(capsule?.getUserShare());
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        flex={1}
                        colorScheme="teal"
                        disabled={}
                        onClick={async () => {
                          await capsule?.setUserShare(pregenUserShare);

                          updateToString();
                        }}
                      >
                        Restore
                      </Button>
                    </HStack>

                    <Button
                      colorScheme="teal"
                      isDisabled={!isSessionActive || Object.values(capsule?.pregenIds || []).flat().length === 0}
                      onClick={async () => {
                        console.log(await capsule?.claimPregenWallets());
                        updateToString();
                      }}
                    >
                      Claim Pregen Wallets
                    </Button>

                    <Button colorScheme="teal" onClick={checkIsSessionActive}>
                      Is Fully Logged In?
                    </Button>
                    <Text>{isSessionActive ? 'Fully Logged In!' : 'Log In Pending...'}</Text>

                    {Object.entries(capsule?.wallets ?? {}).length > 0 && (
                      <Select
                        value={`${walletType}~${walletId}`}
                        onChange={e => {
                          const [walletType, walletId] = e.target.value.split('~');

                          setWallet([walletType as WalletType, walletId]);
                        }}
                      >
                        {Object.entries(capsule?.currentWalletIds ?? {}).map(([type, ids]) => (
                          <>
                            {ids.map(id => (
                              <option key={id} value={`${type}~${id}`}>
                                {type}: {id}
                              </option>
                            ))}
                          </>
                        ))}
                        {Object.values(capsule?.wallets)
                          .filter(w => !w.userId || (w.isPregen && !!w.pregenIdentifier))
                          .map(w => {
                            return (
                              <option key={w.id} value={`${w.type}~${w.id}`}>
                                {w.type}: {w.id}
                              </option>
                            );
                          })}
                      </Select>
                    )}

                    <HStack>
                      <Text whiteSpace="nowrap">Wallet Address:</Text>
                      <Box
                        flexGrow={1}
                        whiteSpace={'nowrap'}
                        overflow={'hidden'}
                        textOverflow={'ellipsis'}
                        fontWeight={'bold'}
                      >
                        {(() => {
                          try {
                            return capsule?.getDisplayAddress(walletId, { addressType: walletType });
                          } catch (e) {
                            return 'none';
                          }
                        })() ?? 'none'}
                      </Box>
                    </HStack>

                    {!!walletId && isPregen && (
                      <>
                        <HStack>
                          <select
                            value={updatePregenIdentifierType}
                            onChange={e => setUpdatePregenIdentifierType(e.currentTarget.value)}
                          >
                            {PREGEN_IDENTIFIER_TYPES.map(type => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                          <Input
                            placeholder="pregen-e-mail"
                            onChange={e => {
                              setUpdatePregenIdentifier(e.target.value);
                            }}
                            value={updatePregenIdentifier}
                          />
                        </HStack>
                        <Button
                          colorScheme="teal"
                          onClick={async () => {
                            await capsule?.updateWalletIdentifierPreGen(
                              updatePregenIdentifier,
                              walletId,
                              updatePregenIdentifierType,
                            );

                            updateToString();
                          }}
                        >
                          Create Pregen Wallet{isMultiWallet && pregenWalletType === 'missing' ? 's' : ''}
                        </Button>
                      </>
                    )}
                    <Input
                      placeholder="message-to-sign"
                      onChange={e => {
                        setMessageToSign(e.target.value);
                      }}
                      value={messageToSign || ''}
                    />
                    <Button colorScheme="teal" isDisabled={!isEvm} onClick={handleSignMessage}>
                      Sign Message
                    </Button>
                    <Text>
                      Message Signature: <strong>{ethersSignature}</strong>
                    </Text>

                    <Text>To Address:</Text>
                    <Input name="To Address" onChange={e => setTxToAddress(e.target.value)} value={txToAddress} />
                    <Text>Value (gwei):</Text>
                    <Input name="Value (gwei)" onChange={e => setTxValue(e.target.value)} value={txValue} />
                    <Text>Gas Amount:</Text>
                    <Input name="Gas Amount" onChange={e => setTxGasAmount(e.target.value)} value={txGasAmount} />
                    <Text>Max Priority Fee Per Gas (gwei):</Text>
                    <Input
                      name="Max Priority Fee Per Gas (gwei)"
                      onChange={e => setTxMaxPriorityFeePerGas(e.target.value)}
                      value={txMaxPriorityFeePerGas}
                    />
                    <Text>Max Fee Per Gas (gwei):</Text>
                    <Input
                      name="Max Fee Per Gas (gwei)"
                      onChange={e => setTxMaxFeePerGas(e.target.value)}
                      value={txMaxFeePerGas}
                    />
                    <Text>Nonce:</Text>
                    <Input name="Nonce" onChange={e => setNonce(e.target.value)} value={nonce} />
                    <Text>Chain ID:</Text>
                    <Input name="Chain ID" onChange={e => setChainId(e.target.value)} value={chainId} />
                    <Text>Smart Contract ABI:</Text>
                    <Input
                      name="Smart Contract ABI"
                      onChange={e => setSmartContractAbi(e.target.value)}
                      value={smartContractAbi}
                    />
                    <Text>Smart Contract Function Name:</Text>
                    <Input
                      name="Smart Contract Function Name"
                      onChange={e => setSmartContractFunctionName(e.target.value)}
                      value={smartContractFunctionName}
                      placeholder={DEFAULT_SMART_CONTRACT_FUNCTION}
                    />
                    <Text>Smart Contract Function Args:</Text>
                    <Input
                      name="Smart Contract Function Args"
                      onChange={e => setSmartContractFunctionArgs(e.target.value)}
                      value={smartContractFunctionArgs}
                      placeholder={JSON.stringify(DEFAULT_SMART_CONTRACT_ARGS)}
                    />
                    <Text>Smart Contract Byte Code:</Text>
                    <Input
                      name="Smart Contract Byte Code"
                      onChange={e => setSmartContractByteCode(e.target.value)}
                      value={smartContractByteCode}
                    />

                    <Button
                      colorScheme="teal"
                      isDisabled={!isEvm}
                      onClick={async () => {
                        const currentWalletId = capsule?.currentWalletIds?.[0];
                        const tx = {
                          from: capsule?.wallets?.[currentWalletId]?.address,
                          to: txToAddress,
                          value: web3.utils.toWei(txValue, 'gwei'),
                          gasLimit: txGasAmount,
                          maxPriorityFeePerGas: txMaxPriorityFeePerGas,
                          maxFeePerGas: txMaxFeePerGas,
                          nonce,
                          chainId,
                          smartContractAbi,
                          smartContractFunctionName,
                          smartContractFunctionArgs: smartContractFunctionArgs ? JSON.parse(smartContractFunctionArgs) : [],
                          smartContractByteCode,
                          type: 2,
                        };

                        sendEthersTransaction(capsule, tx);
                      }}
                    >
                      Send Transaction
                    </Button>
                    <Button
                      colorScheme="teal"
                      isDisabled={!isEvm}
                      onClick={async () => {
                        await sendCosmosTx(capsule);
                      }}
                    >
                      Send Cosmos Transaction
                    </Button>
                    <Text>
                      Solana Signature: <strong>{solanaSignature}</strong>
                    </Text>
                    <Button
                      colorScheme="teal"
                      isDisabled={!isSolana}
                      onClick={async () => {
                        await sendSolanaTx(capsule, walletId, setSolanaSignature);
                      }}
                    >
                      Send Solana Transaction
                    </Button>
                    <Button
                      colorScheme={'teal'}
                      onClick={async () => {
                        const currentWalletId = capsule?.currentWalletIds?.[0];
                        const tx = await createTransaction(
                          capsule?.wallets?.[currentWalletId]?.address,
                          MINTER_CONTRACT_ADDRESS,
                          MINT_PRICE,
                          '140000',
                          '1',
                          '3',
                          nonce,
                          DEFAULT_CHAIN_ID,
                          JSON.stringify(MINTER_CONTRACT_ABI),
                          'mintPublic',
                          [NFT_CONTRACT_ADDRESS, MINTER_FEE_RECIPIENT, MINTER_IF_NOT_PAYER, MINTER_QUANTITY],
                          '',
                        );

                        sendEthersMintNFTTransaction(capsule, tx);
                      }}
                    >
                      Mint NFT
                    </Button>
                    <OfframpSend
                      capsule={capsule}
                      walletId={walletId}
                      walletType={walletType}
                      testMode={onRampTestMode}
                      setTestMode={setOnRampTestMode}
                    />
                    <Button
                      colorScheme="red"
                      onClick={async () => {
                        await capsule?.logout();
                        await capsule?.clearStorage();

                        updateToString();
                      }}
                    >
                      Logout and Clear Storage
                    </Button>
                  </>
                </VStack>
                <Box flexGrow={1} bg="#222" overflow="auto" maxH="100vh" position="sticky" top={0}>
                  <Box color="white" fontFamily={'monospace'} whiteSpace={'pre'} p={6} fontSize="14px">
                    {capsuleError?.message ?? capsule?.toString()}
                  </Box>
                </Box>
              </HStack>
            </VStack>
          )}
        </Container>
        {capsule && (
          <CapsuleModal
            isOpen={modalIsOpen}
            capsule={capsule}
            appName={(partners || []).find(({ apiKey }) => apiKey === selectedApiKey)?.displayName || 'Example'}
            onClose={handleOnClose}
            oAuthMethods={[
              OAuthMethod.GOOGLE,
              OAuthMethod.TELEGRAM,
              OAuthMethod.FACEBOOK,
              OAuthMethod.APPLE,
              OAuthMethod.TWITTER,
              OAuthMethod.DISCORD,
              OAuthMethod.FARCASTER,
            ]}
            onRampTestMode={onRampTestMode}
            hideWallets={hideWallets}
            twoFactorAuthEnabled
            theme={
              useTheme
                ? {
                    mode: isDarkTheme ? 'dark' : 'light',
                    backgroundColor,
                    foregroundColor,
                    borderRadius,
                    font,
                    oAuthLogoVariant: logoVariant,
                  }
                : {}
            }
            logo={logo !== '' ? logo : undefined}
            currentStepOverride={currentStepOverride ?? undefined}
          />
        )}
      </ChakraProvider>
      <ToastContainer />
    </>
  );
}

const createTransaction = async (
  walletAddress: string,
  toAddress: string,
  value: string,
  gasAmount: string,
  maxPriorityFeePerGas: string | null,
  maxFeePerGas: string,
  nonce: number,
  chainId: string,
  contractAbi: string,
  functionName: string,
  functionArgs: string[],
  deployByteCode: string,
) => {
  let functionCallData;
  if (functionName && contractAbi) {
    const contract = new web3.eth.Contract(JSON.parse(contractAbi), toAddress);
    functionCallData = contract.methods[functionName](...functionArgs).encodeABI();
  }

  const tx = {
    from: walletAddress,
    to: toAddress,
    value: web3.utils.toWei(value, 'ether'),
    gasLimit: Number(gasAmount),
    maxPriorityFeePerGas: maxPriorityFeePerGas,
    maxFeePerGas: maxFeePerGas,
    nonce: web3.utils.toHex(nonce),
    data: functionCallData || deployByteCode || undefined,
    chainId,
    type: 2,
  };
  return tx;
};

export const MINTER_CONTRACT_ADDRESS = '0x00005ea00ac477b1030ce78506496e8c2de24bf5';
export const MINT_PRICE = '0.0000001';
export const MINTER_FEE_RECIPIENT = '0x0000a26b00c1F0DF003000390027140000fAa719';
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const MINTER_IF_NOT_PAYER = ZERO_ADDRESS;
export const MINTER_QUANTITY = '1';

export const NFT_CONTRACT_ADDRESS = '0xdAfB9d117B585E406A74E84977Fa82DdEE8B0a32';

export const INFURA_HOST = 'https://sepolia.infura.io/v3/961364684c7346c080994baab1469ea8';

const MINTER_CONTRACT_ABI = [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  { inputs: [], name: 'CreatorPayoutAddressCannotBeZeroAddress', type: 'error' },
  { inputs: [], name: 'DuplicateFeeRecipient', type: 'error' },
  { inputs: [], name: 'DuplicatePayer', type: 'error' },
  { inputs: [], name: 'FeeRecipientCannotBeZeroAddress', type: 'error' },
  { inputs: [], name: 'FeeRecipientNotAllowed', type: 'error' },
  { inputs: [], name: 'FeeRecipientNotPresent', type: 'error' },
  {
    inputs: [
      { internalType: 'uint256', name: 'got', type: 'uint256' },
      { internalType: 'uint256', name: 'want', type: 'uint256' },
    ],
    name: 'IncorrectPayment',
    type: 'error',
  },
  { inputs: [{ internalType: 'uint256', name: 'feeBps', type: 'uint256' }], name: 'InvalidFeeBps', type: 'error' },
  { inputs: [], name: 'InvalidProof', type: 'error' },
  {
    inputs: [{ internalType: 'address', name: 'recoveredSigner', type: 'address' }],
    name: 'InvalidSignature',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'got', type: 'uint256' },
      { internalType: 'uint256', name: 'maximum', type: 'uint256' },
    ],
    name: 'InvalidSignedEndTime',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'got', type: 'uint256' },
      { internalType: 'uint256', name: 'minimumOrMaximum', type: 'uint256' },
    ],
    name: 'InvalidSignedFeeBps',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'got', type: 'uint256' },
      { internalType: 'uint256', name: 'maximum', type: 'uint256' },
    ],
    name: 'InvalidSignedMaxTokenSupplyForStage',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'got', type: 'uint256' },
      { internalType: 'uint256', name: 'maximum', type: 'uint256' },
    ],
    name: 'InvalidSignedMaxTotalMintableByWallet',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'got', type: 'uint256' },
      { internalType: 'uint256', name: 'minimum', type: 'uint256' },
    ],
    name: 'InvalidSignedMintPrice',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'got', type: 'uint256' },
      { internalType: 'uint256', name: 'minimum', type: 'uint256' },
    ],
    name: 'InvalidSignedStartTime',
    type: 'error',
  },
  { inputs: [], name: 'MintQuantityCannotBeZero', type: 'error' },
  {
    inputs: [
      { internalType: 'uint256', name: 'total', type: 'uint256' },
      { internalType: 'uint256', name: 'allowed', type: 'uint256' },
    ],
    name: 'MintQuantityExceedsMaxMintedPerWallet',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'total', type: 'uint256' },
      { internalType: 'uint256', name: 'maxSupply', type: 'uint256' },
    ],
    name: 'MintQuantityExceedsMaxSupply',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'total', type: 'uint256' },
      { internalType: 'uint256', name: 'maxTokenSupplyForStage', type: 'uint256' },
    ],
    name: 'MintQuantityExceedsMaxTokenSupplyForStage',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'currentTimestamp', type: 'uint256' },
      { internalType: 'uint256', name: 'startTimestamp', type: 'uint256' },
      { internalType: 'uint256', name: 'endTimestamp', type: 'uint256' },
    ],
    name: 'NotActive',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'address', name: 'sender', type: 'address' }],
    name: 'OnlyINonFungibleSeaDropToken',
    type: 'error',
  },
  { inputs: [], name: 'PayerCannotBeZeroAddress', type: 'error' },
  { inputs: [], name: 'PayerNotAllowed', type: 'error' },
  { inputs: [], name: 'PayerNotPresent', type: 'error' },
  { inputs: [], name: 'SignatureAlreadyUsed', type: 'error' },
  { inputs: [], name: 'SignedMintsMustRestrictFeeRecipients', type: 'error' },
  { inputs: [], name: 'SignerCannotBeZeroAddress', type: 'error' },
  { inputs: [], name: 'SignerNotPresent', type: 'error' },
  { inputs: [], name: 'TokenGatedDropAllowedNftTokenCannotBeDropToken', type: 'error' },
  { inputs: [], name: 'TokenGatedDropAllowedNftTokenCannotBeZeroAddress', type: 'error' },
  { inputs: [], name: 'TokenGatedDropStageNotPresent', type: 'error' },
  {
    inputs: [
      { internalType: 'address', name: 'nftContract', type: 'address' },
      { internalType: 'address', name: 'allowedNftToken', type: 'address' },
      { internalType: 'uint256', name: 'allowedNftTokenId', type: 'uint256' },
    ],
    name: 'TokenGatedNotTokenOwner',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'address', name: 'nftContract', type: 'address' },
      { internalType: 'address', name: 'allowedNftToken', type: 'address' },
      { internalType: 'uint256', name: 'allowedNftTokenId', type: 'uint256' },
    ],
    name: 'TokenGatedTokenIdAlreadyRedeemed',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'nftContract', type: 'address' },
      { indexed: true, internalType: 'bytes32', name: 'previousMerkleRoot', type: 'bytes32' },
      { indexed: true, internalType: 'bytes32', name: 'newMerkleRoot', type: 'bytes32' },
      { indexed: false, internalType: 'string[]', name: 'publicKeyURI', type: 'string[]' },
      { indexed: false, internalType: 'string', name: 'allowListURI', type: 'string' },
    ],
    name: 'AllowListUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'nftContract', type: 'address' },
      { indexed: true, internalType: 'address', name: 'feeRecipient', type: 'address' },
      { indexed: true, internalType: 'bool', name: 'allowed', type: 'bool' },
    ],
    name: 'AllowedFeeRecipientUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'nftContract', type: 'address' },
      { indexed: true, internalType: 'address', name: 'newPayoutAddress', type: 'address' },
    ],
    name: 'CreatorPayoutAddressUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'nftContract', type: 'address' },
      { indexed: false, internalType: 'string', name: 'newDropURI', type: 'string' },
    ],
    name: 'DropURIUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'nftContract', type: 'address' },
      { indexed: true, internalType: 'address', name: 'payer', type: 'address' },
      { indexed: true, internalType: 'bool', name: 'allowed', type: 'bool' },
    ],
    name: 'PayerUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'nftContract', type: 'address' },
      {
        components: [
          { internalType: 'uint80', name: 'mintPrice', type: 'uint80' },
          { internalType: 'uint48', name: 'startTime', type: 'uint48' },
          { internalType: 'uint48', name: 'endTime', type: 'uint48' },
          { internalType: 'uint16', name: 'maxTotalMintableByWallet', type: 'uint16' },
          { internalType: 'uint16', name: 'feeBps', type: 'uint16' },
          { internalType: 'bool', name: 'restrictFeeRecipients', type: 'bool' },
        ],
        indexed: false,
        internalType: 'struct PublicDrop',
        name: 'publicDrop',
        type: 'tuple',
      },
    ],
    name: 'PublicDropUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'nftContract', type: 'address' },
      { indexed: true, internalType: 'address', name: 'minter', type: 'address' },
      { indexed: true, internalType: 'address', name: 'feeRecipient', type: 'address' },
      { indexed: false, internalType: 'address', name: 'payer', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'quantityMinted', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'unitMintPrice', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'feeBps', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'dropStageIndex', type: 'uint256' },
    ],
    name: 'SeaDropMint',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'nftContract', type: 'address' },
      { indexed: true, internalType: 'address', name: 'signer', type: 'address' },
      {
        components: [
          { internalType: 'uint80', name: 'minMintPrice', type: 'uint80' },
          { internalType: 'uint24', name: 'maxMaxTotalMintableByWallet', type: 'uint24' },
          { internalType: 'uint40', name: 'minStartTime', type: 'uint40' },
          { internalType: 'uint40', name: 'maxEndTime', type: 'uint40' },
          { internalType: 'uint40', name: 'maxMaxTokenSupplyForStage', type: 'uint40' },
          { internalType: 'uint16', name: 'minFeeBps', type: 'uint16' },
          { internalType: 'uint16', name: 'maxFeeBps', type: 'uint16' },
        ],
        indexed: false,
        internalType: 'struct SignedMintValidationParams',
        name: 'signedMintValidationParams',
        type: 'tuple',
      },
    ],
    name: 'SignedMintValidationParamsUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'nftContract', type: 'address' },
      { indexed: true, internalType: 'address', name: 'allowedNftToken', type: 'address' },
      {
        components: [
          { internalType: 'uint80', name: 'mintPrice', type: 'uint80' },
          { internalType: 'uint16', name: 'maxTotalMintableByWallet', type: 'uint16' },
          { internalType: 'uint48', name: 'startTime', type: 'uint48' },
          { internalType: 'uint48', name: 'endTime', type: 'uint48' },
          { internalType: 'uint8', name: 'dropStageIndex', type: 'uint8' },
          { internalType: 'uint32', name: 'maxTokenSupplyForStage', type: 'uint32' },
          { internalType: 'uint16', name: 'feeBps', type: 'uint16' },
          { internalType: 'bool', name: 'restrictFeeRecipients', type: 'bool' },
        ],
        indexed: false,
        internalType: 'struct TokenGatedDropStage',
        name: 'dropStage',
        type: 'tuple',
      },
    ],
    name: 'TokenGatedDropStageUpdated',
    type: 'event',
  },
  {
    inputs: [{ internalType: 'address', name: 'nftContract', type: 'address' }],
    name: 'getAllowListMerkleRoot',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'nftContract', type: 'address' }],
    name: 'getAllowedFeeRecipients',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'nftContract', type: 'address' },
      { internalType: 'address', name: 'allowedNftToken', type: 'address' },
      { internalType: 'uint256', name: 'allowedNftTokenId', type: 'uint256' },
    ],
    name: 'getAllowedNftTokenIdIsRedeemed',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'nftContract', type: 'address' }],
    name: 'getCreatorPayoutAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'nftContract', type: 'address' },
      { internalType: 'address', name: 'feeRecipient', type: 'address' },
    ],
    name: 'getFeeRecipientIsAllowed',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'nftContract', type: 'address' },
      { internalType: 'address', name: 'payer', type: 'address' },
    ],
    name: 'getPayerIsAllowed',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'nftContract', type: 'address' }],
    name: 'getPayers',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'nftContract', type: 'address' }],
    name: 'getPublicDrop',
    outputs: [
      {
        components: [
          { internalType: 'uint80', name: 'mintPrice', type: 'uint80' },
          { internalType: 'uint48', name: 'startTime', type: 'uint48' },
          { internalType: 'uint48', name: 'endTime', type: 'uint48' },
          { internalType: 'uint16', name: 'maxTotalMintableByWallet', type: 'uint16' },
          { internalType: 'uint16', name: 'feeBps', type: 'uint16' },
          { internalType: 'bool', name: 'restrictFeeRecipients', type: 'bool' },
        ],
        internalType: 'struct PublicDrop',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'nftContract', type: 'address' },
      { internalType: 'address', name: 'signer', type: 'address' },
    ],
    name: 'getSignedMintValidationParams',
    outputs: [
      {
        components: [
          { internalType: 'uint80', name: 'minMintPrice', type: 'uint80' },
          { internalType: 'uint24', name: 'maxMaxTotalMintableByWallet', type: 'uint24' },
          { internalType: 'uint40', name: 'minStartTime', type: 'uint40' },
          { internalType: 'uint40', name: 'maxEndTime', type: 'uint40' },
          { internalType: 'uint40', name: 'maxMaxTokenSupplyForStage', type: 'uint40' },
          { internalType: 'uint16', name: 'minFeeBps', type: 'uint16' },
          { internalType: 'uint16', name: 'maxFeeBps', type: 'uint16' },
        ],
        internalType: 'struct SignedMintValidationParams',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'nftContract', type: 'address' }],
    name: 'getSigners',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'nftContract', type: 'address' }],
    name: 'getTokenGatedAllowedTokens',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'nftContract', type: 'address' },
      { internalType: 'address', name: 'allowedNftToken', type: 'address' },
    ],
    name: 'getTokenGatedDrop',
    outputs: [
      {
        components: [
          { internalType: 'uint80', name: 'mintPrice', type: 'uint80' },
          { internalType: 'uint16', name: 'maxTotalMintableByWallet', type: 'uint16' },
          { internalType: 'uint48', name: 'startTime', type: 'uint48' },
          { internalType: 'uint48', name: 'endTime', type: 'uint48' },
          { internalType: 'uint8', name: 'dropStageIndex', type: 'uint8' },
          { internalType: 'uint32', name: 'maxTokenSupplyForStage', type: 'uint32' },
          { internalType: 'uint16', name: 'feeBps', type: 'uint16' },
          { internalType: 'bool', name: 'restrictFeeRecipients', type: 'bool' },
        ],
        internalType: 'struct TokenGatedDropStage',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'nftContract', type: 'address' },
      { internalType: 'address', name: 'feeRecipient', type: 'address' },
      { internalType: 'address', name: 'minterIfNotPayer', type: 'address' },
      { internalType: 'uint256', name: 'quantity', type: 'uint256' },
      {
        components: [
          { internalType: 'uint256', name: 'mintPrice', type: 'uint256' },
          { internalType: 'uint256', name: 'maxTotalMintableByWallet', type: 'uint256' },
          { internalType: 'uint256', name: 'startTime', type: 'uint256' },
          { internalType: 'uint256', name: 'endTime', type: 'uint256' },
          { internalType: 'uint256', name: 'dropStageIndex', type: 'uint256' },
          { internalType: 'uint256', name: 'maxTokenSupplyForStage', type: 'uint256' },
          { internalType: 'uint256', name: 'feeBps', type: 'uint256' },
          { internalType: 'bool', name: 'restrictFeeRecipients', type: 'bool' },
        ],
        internalType: 'struct MintParams',
        name: 'mintParams',
        type: 'tuple',
      },
      { internalType: 'bytes32[]', name: 'proof', type: 'bytes32[]' },
    ],
    name: 'mintAllowList',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'nftContract', type: 'address' },
      { internalType: 'address', name: 'feeRecipient', type: 'address' },
      { internalType: 'address', name: 'minterIfNotPayer', type: 'address' },
      {
        components: [
          { internalType: 'address', name: 'allowedNftToken', type: 'address' },
          { internalType: 'uint256[]', name: 'allowedNftTokenIds', type: 'uint256[]' },
        ],
        internalType: 'struct TokenGatedMintParams',
        name: 'mintParams',
        type: 'tuple',
      },
    ],
    name: 'mintAllowedTokenHolder',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'nftContract', type: 'address' },
      { internalType: 'address', name: 'feeRecipient', type: 'address' },
      { internalType: 'address', name: 'minterIfNotPayer', type: 'address' },
      { internalType: 'uint256', name: 'quantity', type: 'uint256' },
    ],
    name: 'mintPublic',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'nftContract', type: 'address' },
      { internalType: 'address', name: 'feeRecipient', type: 'address' },
      { internalType: 'address', name: 'minterIfNotPayer', type: 'address' },
      { internalType: 'uint256', name: 'quantity', type: 'uint256' },
      {
        components: [
          { internalType: 'uint256', name: 'mintPrice', type: 'uint256' },
          { internalType: 'uint256', name: 'maxTotalMintableByWallet', type: 'uint256' },
          { internalType: 'uint256', name: 'startTime', type: 'uint256' },
          { internalType: 'uint256', name: 'endTime', type: 'uint256' },
          { internalType: 'uint256', name: 'dropStageIndex', type: 'uint256' },
          { internalType: 'uint256', name: 'maxTokenSupplyForStage', type: 'uint256' },
          { internalType: 'uint256', name: 'feeBps', type: 'uint256' },
          { internalType: 'bool', name: 'restrictFeeRecipients', type: 'bool' },
        ],
        internalType: 'struct MintParams',
        name: 'mintParams',
        type: 'tuple',
      },
      { internalType: 'uint256', name: 'salt', type: 'uint256' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'mintSigned',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'merkleRoot', type: 'bytes32' },
          { internalType: 'string[]', name: 'publicKeyURIs', type: 'string[]' },
          { internalType: 'string', name: 'allowListURI', type: 'string' },
        ],
        internalType: 'struct AllowListData',
        name: 'allowListData',
        type: 'tuple',
      },
    ],
    name: 'updateAllowList',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'feeRecipient', type: 'address' },
      { internalType: 'bool', name: 'allowed', type: 'bool' },
    ],
    name: 'updateAllowedFeeRecipient',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_payoutAddress', type: 'address' }],
    name: 'updateCreatorPayoutAddress',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: 'dropURI', type: 'string' }],
    name: 'updateDropURI',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'payer', type: 'address' },
      { internalType: 'bool', name: 'allowed', type: 'bool' },
    ],
    name: 'updatePayer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'uint80', name: 'mintPrice', type: 'uint80' },
          { internalType: 'uint48', name: 'startTime', type: 'uint48' },
          { internalType: 'uint48', name: 'endTime', type: 'uint48' },
          { internalType: 'uint16', name: 'maxTotalMintableByWallet', type: 'uint16' },
          { internalType: 'uint16', name: 'feeBps', type: 'uint16' },
          { internalType: 'bool', name: 'restrictFeeRecipients', type: 'bool' },
        ],
        internalType: 'struct PublicDrop',
        name: 'publicDrop',
        type: 'tuple',
      },
    ],
    name: 'updatePublicDrop',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'signer', type: 'address' },
      {
        components: [
          { internalType: 'uint80', name: 'minMintPrice', type: 'uint80' },
          { internalType: 'uint24', name: 'maxMaxTotalMintableByWallet', type: 'uint24' },
          { internalType: 'uint40', name: 'minStartTime', type: 'uint40' },
          { internalType: 'uint40', name: 'maxEndTime', type: 'uint40' },
          { internalType: 'uint40', name: 'maxMaxTokenSupplyForStage', type: 'uint40' },
          { internalType: 'uint16', name: 'minFeeBps', type: 'uint16' },
          { internalType: 'uint16', name: 'maxFeeBps', type: 'uint16' },
        ],
        internalType: 'struct SignedMintValidationParams',
        name: 'signedMintValidationParams',
        type: 'tuple',
      },
    ],
    name: 'updateSignedMintValidationParams',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'allowedNftToken', type: 'address' },
      {
        components: [
          { internalType: 'uint80', name: 'mintPrice', type: 'uint80' },
          { internalType: 'uint16', name: 'maxTotalMintableByWallet', type: 'uint16' },
          { internalType: 'uint48', name: 'startTime', type: 'uint48' },
          { internalType: 'uint48', name: 'endTime', type: 'uint48' },
          { internalType: 'uint8', name: 'dropStageIndex', type: 'uint8' },
          { internalType: 'uint32', name: 'maxTokenSupplyForStage', type: 'uint32' },
          { internalType: 'uint16', name: 'feeBps', type: 'uint16' },
          { internalType: 'bool', name: 'restrictFeeRecipients', type: 'bool' },
        ],
        internalType: 'struct TokenGatedDropStage',
        name: 'dropStage',
        type: 'tuple',
      },
    ],
    name: 'updateTokenGatedDrop',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(<App />);
