// @ts-nocheck
import React, { useCallback, useEffect, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import ReactDOM from 'react-dom/client';
import {
  Box,
  Button,
  ChakraProvider,
  Checkbox,
  Container,
  Flex,
  HStack,
  IconButton,
  Input,
  Select,
  Text,
  VStack,
} from '@chakra-ui/react';
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
import Capsule, { isCosmosWithPrefix } from '@usecapsule/web-sdk';
import {
  CapsuleModal,
  OAuthMethod,
  ON_RAMP_PROVIDERS,
  NETWORKS,
  validateOnRampConfig,
  OnRampConfigError,
  openPopup,
} from '@usecapsule/react-sdk';
import { FeeMarketEIP1559Transaction } from '@ethereumjs/tx';
import { CapsuleProtoSigner } from '@usecapsule/cosmjs-v0-integration';
import { CapsuleEthersSigner } from '@usecapsule/ethers-v6-integration';
import { createCapsuleViemClient } from '@usecapsule/viem-v1-integration';
import { CapsuleConnector, CapsuleEIP1193Provider } from '@usecapsule/wagmi-v1-integration';
import CoreCapsule, {
  Environment,
  ConstructorOpts,
  DeniedSignatureResWithUrl,
  PregenIdentifierType,
  OnRampConfig,
  OnRampAsset,
  OnRampProvider,
  getProvider,
  getNetwork,
  OnRampProviderAssetMap,
  getBaseUrl,
  TransactionReviewError,
  Network,
  SupportedWalletTypes,
  WalletType,
  NON_ED25519,
} from '@usecapsule/core-sdk';
import { CapsuleSolanaWeb3Signer } from '@usecapsule/solana-web3.js-v1-integration';
import { FONT_OPTIONS } from './constants';
import '@usecapsule/react-sdk/styles.css';
import { ArrowUpIcon, ArrowDownIcon, SmallCloseIcon, AddIcon } from '@chakra-ui/icons';
import { stringToPhoneNumber } from '@usecapsule/core-sdk';

interface Partner {
  apiKey: string;
  id: string;
  name: string;
  displayName: string;
}

const ON_RAMP_ASSETS = {
  [OnRampAsset.ETHEREUM]: 'Ethereum',
  [OnRampAsset.USDC]: 'USDC',
  [OnRampAsset.POLYGON]: 'Polygon',
};

// sample transaction params
const DEFAULT_TO_ADDRESS = '0x42c9a72c9dfcc92cae0de9510160cea2da27af91';
const DEFAULT_VALUE = '1000';
const DEFAULT_GAS_AMOUNT = '21000';
const DEFAULT_MAX_PRIORITY_FEE_PER_GAS = '1';
const DEFAULT_MAX_FEE_PER_GAS = '3';
const DEFAULT_NONCE = '0';
const API_KEY_WITH_BRANDING = '8ee2d015fbc6062a6e30bdc472f2946c';

const ALCHEMY_SEPOLIA_PROVIDER = 'https://eth-sepolia.g.alchemy.com/v2/KfxK8ZFXw9mTUuJ7jt751xGJCa3r8noZ';
// goerli chain id
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
const DEFAULT_RAMP_HOST_API_KEY = '7t45dxm7yhho7fr9u4b9k8nv9gvczansfu8zt9pm';
const DEFAULT_ONRAMP_CONFIG = {
  testMode: true,
  network: Network.ETHEREUM,
  asset: OnRampAsset.ETHEREUM,
  providers: [{ id: OnRampProvider.STRIPE }, { id: OnRampProvider.RAMP, hostApiKey: DEFAULT_RAMP_HOST_API_KEY }],
};
const DEFAULT_NETWORKS = ['ETHEREUM', 'BASE'];
const COSMOS_TESTNET_RPC = 'wss://rpc.sentry-01.theta-testnet.polypore.xyz';
const COSMOS_DEFAULT_TO_ADDRESS = 'cosmos1f3px9t4juk43cwufj7f9s64z3wj7xvyc0rexg6';
const web3 = new Web3();

const THEMES = {
  devRed: ['www.red.com', 'https://i.imgur.com/7joBw13.png', '#ffffff', '#ff2222', 'none', 'dark'],
  devBlue: ['www.blue.com', 'https://i.imgur.com/rIqjbim.png', '#222222', '#33bbff', 'lg', 'branded'],
  devGreen: ['www.green.com', 'https://i.imgur.com/xQOZmn6.png', '#161616', '#2fdd86', 'sm', 'branded'],
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

  console.log(
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
    ),
  );
}

const SOLANA_RECIPIENT_PUBLIC_KEY = '4TUYF5Q6sCkBCjamQrTkNYJyxhyaCPiPnq9oVg6qXbTp';
const SOLANA_DEVNET_RPC_ENDPOINT = 'https://api.devnet.solana.com';

async function sendSolanaTx(capsule: Capsule, setSig: any): Promise<void> {
  const connection = new solana.Connection(SOLANA_DEVNET_RPC_ENDPOINT, 'confirmed');
  const solanaSigner = new CapsuleSolanaWeb3Signer(capsule, connection);
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

  const rawTxRes = await solanaSigner.sendTransaction(tx, {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  });
  console.log(`solana signature: ${rawTxRes}`);
  setSig(rawTxRes);
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
            console.log(error);
            // if ((res as DeniedSignatureResWithUrl).transactionReviewUrl) {
            //   openPopup((res as DeniedSignatureResWithUrl).transactionReviewUrl, 'TransactionReview', 'REVIEW_TRANSACTION')
            //   // setTransactionReviewUrl((res as DeniedSignatureResWithUrl).transactionReviewUrl);
            // }
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

async function _sendEthersTransaction(): Promise<void> {
  const currentWalletId = capsule.currentWalletIds?.[0];
  if (!currentWalletId) {
    return;
  }
  const tx = {
    from: capsule.wallets?.[currentWalletId]?.address,
    to: DEFAULT_TO_ADDRESS,
    value: 1010000000,
    gasLimit: 21000,
    maxPriorityFeePerGas: 1000000000,
    maxFeePerGas: 3000000000,
    nonce: 1,
    chainId: DEFAULT_CHAIN_ID,
    type: 2,
  };
  const provider = new ethers.JsonRpcProvider(ALCHEMY_SEPOLIA_PROVIDER, 'sepolia');
  const ethersSigner = new CapsuleEthersSigner(capsule, provider, currentWalletId);
  const res = await ethersSigner.sendTransaction(tx);
  console.log('send ethers tx response:\n', res);
}

async function createTransaction(
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
  const [foregroundColor, setForegroundColor] = useLocalStorage('@EXAMPLE-CAPSULE/foregroundColor', '#FAFAFA');
  const [backgroundColor, setBackgroundColor] = useLocalStorage('@EXAMPLE-CAPSULE/backgroundColor', '#121212');
  const [borderRadius, setBorderRadius] = useLocalStorage('@EXAMPLE-CAPSULE/borderRadius', 'sm');
  const [font, setFont] = useLocalStorage('@EXAMPLE-CAPSULE/font', 'inter');
  const [logoVariant, setLogoVariant] = useLocalStorage('@EXAMPLE-CAPSULE/logoVariant', 'branded');

  const [supportedWalletTypes, setSupportedWalletTypes] = useLocalStorage<SupportedWalletTypes>(
    '@EXAMPLE-CAPSULE/supportedWalletTypes',
    { EVM: true },
  );
  const [useOnRampConfig, setUseOnRampConfig] = useLocalStorage('@EXAMPLE-CAPSULE/useOnRampConfig', true);
  const [onRampConfig, setOnRampConfig] = useLocalStorage<OnRampConfig | undefined>(
    '@EXAMPLE-CAPSULE/onRampConfig',
    DEFAULT_ONRAMP_CONFIG,
  );
  const [onRampConfigError, setOnRampConfigError] = useState<OnRampConfigError | undefined>();
  const [networks, setNetworks] = useState<Network[]>(DEFAULT_NETWORKS);

  const [pregenEmail, setPregenEmail] = useState('');
  const [pregenPhone, setPregenPhone] = useState('');
  const [pregenUserShare, setPregenUserShare] = useLocalStorage<BorderRadius>('@EXAMPLE-CAPSULE/pregenUserShare', '');
  const [pregenType, setPregenType] = useLocalStorage<WalletType>('@EXAMPLE-CAPSULE/pregenType', 'EVM');
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

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const capsule = React.useMemo(
    () =>
      new Capsule(selectedEnv, selectedApiKey, {
        ...getCapsuleOpts(selectedEnv, useDKLS),
        homepageUrl,
        xUrl: 'https://twitter.com/usecapsule',
        linkedinUrl: 'https://www.linkedin.com/company/usecapsule',
        supportUrl: 'mailto:support@usecapsule.com',
        portalTheme: useTheme ? { backgroundColor, foregroundColor } : undefined,
        supportedWalletTypes,
      }),
    [selectedEnv, useDKLS, selectedApiKey, foregroundColor, backgroundColor, useTheme, homepageUrl, supportedWalletTypes],
  );

  const [, setCapsuleToString] = useState(capsule.toString());

  function updateToString() {
    setCapsuleToString(capsule.toString());
  }

  async function checkIsSessionActive() {
    const isFullyLoggedIn = await capsule.isSessionActive();
    setIsSessionActive(isFullyLoggedIn);
    if (isFullyLoggedIn && capsule instanceof CoreCapsule) {
      console.log(`exported session:\n${(capsule as CoreCapsule).exportSession()}`);
    }

    const [email, phone] = [capsule.getEmail(), capsule.getPhoneNumber()];

    email && setPregenEmail(email);
    phone && setPregenPhone(phone);
  }

  useEffect(() => {
    checkIsSessionActive();
  }, []);

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
    try {
      validateOnRampConfig(onRampConfig);
      setOnRampConfigError(undefined);
    } catch (e) {
      setOnRampConfigError(e as OnRampConfigError);
    }
  }, [onRampConfig]);

  useEffect(() => {
    if (partners) {
      const partner = partners.find(({ apiKey }) => selectedApiKey === apiKey);
      if (partner && Object.keys(THEMES).includes(partner.name)) {
        const [
          themeHomepageUrl,
          themeModalLogo,
          themeBackgroundColor,
          themeForegroundColor,
          themeBorderRadius,
          themeLogoVariant,
        ] = THEMES[partner.name];
        setUseTheme(true);
        setLogo(themeModalLogo);
        setHomepageUrl(themeHomepageUrl);
        setForegroundColor(themeForegroundColor);
        setBackgroundColor(themeBackgroundColor);
        setBorderRadius(themeBorderRadius);
        setLogoVariant(themeLogoVariant);
      }
    }
  }, [selectedApiKey, partners]);

  const handleOnClose = async () => {
    setModalIsOpen(false);
    await checkIsSessionActive();
  };

  const handleDeleteClick = async () => {
    setDeleteButtonDisabled(true);
    if (!(await capsule.isFullyLoggedIn())) {
      throw new Error('Need to be fully loggedIn to delete user.');
    }
    const res = await capsule.ctx.capsuleClient.deleteSelf((capsule as CoreCapsule).getUserId());

    await capsule.logout();

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
    try {
      const provider = new ethers.JsonRpcProvider(ALCHEMY_SEPOLIA_PROVIDER, 'sepolia');
      const ethersSigner = new CapsuleEthersSigner(capsule, provider, capsule.currentWalletIds?.[0]);
      const messageSignature = await ethersSigner.signMessage(messageToSign);
      setEthersSignature(messageSignature);
    } catch (error) {
      console.error(error);
      if (error instanceof TransactionReviewError) {
        console.log(error.transactionReviewUrl);
        openPopup(error.transactionReviewUrl, 'ReviewTransaction', 'REVIEW_TRANSACTION');
      }
    }
  }, [capsule, messageToSign]);

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
                  <strong>Supported Wallet Types:</strong>
                </Text>
                <HStack gap={12}>
                  {['EVM', 'SOLANA', 'COSMOS'].map(walletType => (
                    <HStack gap={2} cursor="pointer">
                      <Checkbox
                        name={walletType}
                        id={`checkbox-${walletType}`}
                        isChecked={!!supportedWalletTypes[walletType]}
                        onChange={e => {
                          if (e.currentTarget.checked) {
                            setSupportedWalletTypes(prev => ({
                              ...prev,
                              [walletType]: walletType === 'COSMOS' ? { prefix: 'cosmos' } : true,
                            }));
                            setPregenType(walletType);
                          } else {
                            setSupportedWalletTypes(({ [walletType]: _, ...prev }) => prev);
                            setPregenType(Object.keys(supportedWalletTypes)[0] as WalletType);
                          }
                        }}
                      />
                      <label htmlFor={`checkbox-${walletType}`}>{walletType}</label>
                    </HStack>
                  ))}
                </HStack>
              </HStack>
              {supportedWalletTypes.COSMOS && (
                <HStack>
                  <Text width={'15%'}>
                    <strong>Cosmos Prefix:</strong>
                  </Text>
                  <Input
                    placeholder="None"
                    onChange={e => {
                      setSupportedWalletTypes({ COSMOS: e.target.value.length > 0 ? { prefix: e.target.value } : true });
                    }}
                    value={isCosmosWithPrefix(supportedWalletTypes) ? supportedWalletTypes.COSMOS.prefix : ''}
                  />
                </HStack>
              )}
              <HStack>
                <Text width={'15%'}>
                  <strong>On-Ramp Configuration:</strong>
                </Text>
                <Checkbox isChecked={useOnRampConfig} onChange={e => setUseOnRampConfig(e.currentTarget.checked)} />
              </HStack>
              {useOnRampConfig && (
                <VStack align="left" ml="40px" opacity={useTheme ? 1 : 0.8}>
                  <HStack>
                    <Text width={'15%'}>
                      <strong>Test Mode:</strong>
                    </Text>
                    <Checkbox
                      isChecked={onRampConfig.testMode}
                      onChange={e => setOnRampConfig(prev => ({ ...prev, testMode: e.currentTarget.checked }))}
                    />
                  </HStack>
                  <HStack>
                    <Text width={'15%'}>
                      <strong>Destination Network:</strong>
                    </Text>
                    <Select
                      defaultValue={onRampConfig.network}
                      onChange={e => setOnRampConfig(prev => ({ ...prev, network: e.target.value as OnRampAsset }))}
                    >
                      {Object.entries(NETWORKS).map(([id, name]) => (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      ))}
                    </Select>
                  </HStack>
                  <HStack>
                    <Text width={'15%'}>
                      <strong>Destination Asset:</strong>
                    </Text>
                    <Select
                      defaultValue={onRampConfig.asset}
                      onChange={e => setOnRampConfig(prev => ({ ...prev, asset: e.target.value as OnRampAsset }))}
                    >
                      {Object.keys(OnRampAsset).map(id => (
                        <option value={id} key={id}>
                          {ON_RAMP_ASSETS[id]}
                        </option>
                      ))}
                    </Select>
                  </HStack>
                  {onRampConfig?.providers && (
                    <HStack alignItems="flex-start">
                      <Text width={'15%'}>
                        <strong>Providers:</strong>
                      </Text>
                      <VStack flexGrow={1} w="100%">
                        {onRampConfig.providers.map((provider, index) => {
                          const isRamp = getProvider(provider.id) === OnRampProvider.RAMP;

                          return (
                            <HStack w="100%" flexGrow={1} borderRadius="lg" bgColor="lightblue" py={1} px={2}>
                              <Text width="15%">{ON_RAMP_PROVIDERS[getProvider(provider.id)].name}</Text>
                              <Flex flexGrow={1}>
                                {isRamp && (
                                  <Input
                                    placeholder="Host API key"
                                    onChange={e => {
                                      setOnRampConfig(prev => ({
                                        ...prev,
                                        providers: prev.providers.map(p => ({
                                          ...p,
                                          ...(getProvider(p.id) === OnRampProvider.RAMP
                                            ? { hostApiKey: e.currentTarget.value }
                                            : {}),
                                        })),
                                      }));
                                    }}
                                    value={provider.hostApiKey as string}
                                  />
                                )}
                              </Flex>
                              <HStack>
                                <IconButton
                                  isDisabled={index === 0 || onRampConfig.providers.length === 1}
                                  icon={<ArrowUpIcon />}
                                  onClick={() => {
                                    setOnRampConfig(prev => ({
                                      ...prev,
                                      providers: [
                                        ...prev.providers.slice(0, index - 1),
                                        prev.providers[index],
                                        prev.providers[index - 1],
                                        ...prev.providers.slice(index + 1),
                                      ],
                                    }));
                                  }}
                                />
                                <IconButton
                                  isDisabled={
                                    index === onRampConfig.providers.length - 1 || onRampConfig.providers.length === 1
                                  }
                                  icon={<ArrowDownIcon />}
                                  onClick={() => {
                                    setOnRampConfig(prev => ({
                                      ...prev,
                                      providers: [
                                        ...prev.providers.slice(0, index),
                                        prev.providers[index + 1],
                                        prev.providers[index],
                                        ...prev.providers.slice(index + 2),
                                      ],
                                    }));
                                  }}
                                />
                                <IconButton
                                  icon={<SmallCloseIcon />}
                                  onClick={() => {
                                    setOnRampConfig(prev => ({
                                      ...prev,
                                      providers: [...prev.providers.slice(0, index), ...prev.providers.slice(index + 1)],
                                    }));
                                  }}
                                />
                              </HStack>
                            </HStack>
                          );
                        })}
                        <HStack w="100%" alignItems="flex-start">
                          {Object.keys(OnRampProviderAssetMap).map((id: OnRampProvider) => {
                            return (
                              <Button
                                colorScheme="teal"
                                variant="ghost"
                                onClick={() => {
                                  setOnRampConfig(prev => ({
                                    ...prev,
                                    providers: [
                                      ...prev.providers,
                                      {
                                        id,
                                        ...(id === OnRampProvider.RAMP ? { hostApiKey: DEFAULT_RAMP_HOST_API_KEY } : {}),
                                      },
                                    ],
                                  }));
                                }}
                              >
                                <AddIcon mr={3} />
                                {ON_RAMP_PROVIDERS[id].name}
                              </Button>
                            );
                          })}
                        </HStack>
                      </VStack>
                    </HStack>
                  )}

                  {onRampConfigError && (
                    <HStack w="100%" borderRadius="lg" bgColor="rgba(255, 0, 0, 0.5)" py={1} px={2}>
                      <span>{onRampConfigError.toString().split(': ').pop()}</span>
                    </HStack>
                  )}
                </VStack>
              )}
              <VStack align="left">
                <HStack alignItems="flex-start">
                  <Text width={'15%'}>
                    <strong>Supported Networks:</strong>
                  </Text>
                  <VStack flexGrow={1} w="100%">
                    {networks.map((network, index) => {
                      return (
                        <HStack w="100%" flexGrow={1} borderRadius="lg" bgColor="lightblue" py={1} px={2}>
                          <Text width="15%">{NETWORKS[getNetwork(network)]}</Text>
                          <HStack>
                            <IconButton
                              isDisabled={index === 0 || networks.length === 1}
                              icon={<ArrowUpIcon />}
                              onClick={() => {
                                setNetworks(prev => [
                                  ...prev.slice(0, index - 1),
                                  prev[index],
                                  prev[index - 1],
                                  ...prev.slice(index + 1),
                                ]);
                              }}
                            />
                            <IconButton
                              isDisabled={index === networks.length - 1 || networks.length === 1}
                              icon={<ArrowDownIcon />}
                              onClick={() => {
                                setNetworks(prev => [
                                  ...prev.slice(0, index),
                                  prev[index + 1],
                                  prev[index],
                                  ...prev.slice(index + 2),
                                ]);
                              }}
                            />
                            <IconButton
                              isDisabled={networks.length === 1}
                              icon={<SmallCloseIcon />}
                              onClick={() => {
                                setNetworks(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
                              }}
                            />
                          </HStack>
                        </HStack>
                      );
                    })}
                    <HStack w="100%" alignItems="flex-start">
                      {Object.keys(Network).map(id => {
                        return networks.find(p => p === id) ? (
                          <></>
                        ) : (
                          <Button
                            colorScheme="teal"
                            variant="ghost"
                            onClick={() => {
                              setNetworks(prev => [...prev, id]);
                            }}
                          >
                            <AddIcon mr={3} />
                            {NETWORKS[id]}
                          </Button>
                        );
                      })}
                    </HStack>
                  </VStack>
                </HStack>
              </VStack>
              <HStack>
                <Button
                  colorScheme="green"
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
                        await capsule.logout(true);
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
                        const newShare = await capsule.distributeNewWalletShare(
                          capsule.currentWalletIds[0],
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
                      <Input
                        placeholder="pregen-e-mail"
                        onChange={e => {
                          setPregenEmail(e.target.value);
                        }}
                        value={pregenEmail}
                      />
                      {Object.keys(supportedWalletTypes).length > 1 && (
                        <select value={pregenType} onChange={e => setPregenType(e.currentTarget.value)}>
                          {Object.keys(supportedWalletTypes).map(walletType => (
                            <option key={walletType} value={walletType}>
                              {walletType}
                            </option>
                          ))}
                        </select>
                      )}
                    </HStack>
                    <Button
                      colorScheme="teal"
                      onClick={async () => {
                        await capsule.createWalletPreGen(pregenType, pregenEmail);

                        updateToString();
                      }}
                    >
                      Create Pregen Wallet
                    </Button>
                    <HStack>
                      <Input
                        placeholder="pregen-phone"
                        onChange={e => {
                          setPregenPhone(e.target.value);
                        }}
                        value={pregenPhone}
                      />
                      {Object.keys(supportedWalletTypes).length > 1 && (
                        <select value={pregenType} onChange={e => setPregenType(e.currentTarget.value)}>
                          {Object.keys(supportedWalletTypes).map(walletType => (
                            <option key={walletType} value={walletType}>
                              {walletType}
                            </option>
                          ))}
                        </select>
                      )}
                    </HStack>
                    <Button
                      colorScheme="teal"
                      onClick={async () => {
                        const formattedNumber = stringToPhoneNumber(pregenPhone);
                        await capsule.createWalletPreGen(pregenType, formattedNumber, PregenIdentifierType.PHONE);
                        updateToString();
                      }}
                    >
                      Create Pregen Wallet Through Phone Number
                    </Button>
                    <Button
                      colorScheme="teal"
                      onClick={async () => {
                        await capsule.updateWalletEmailPreGen(pregenEmail);

                        updateToString();
                      }}
                    >
                      Edit Pregen Wallet Email
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
                          setPregenUserShare(capsule.getUserShare());
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        flex={1}
                        colorScheme="teal"
                        disabled={}
                        onClick={async () => {
                          await capsule.setUserShare(pregenUserShare);

                          updateToString();
                        }}
                      >
                        Restore
                      </Button>
                    </HStack>

                    <Button
                      colorScheme="teal"
                      onClick={async () => {
                        await capsule.setUserShare(pregenUserShare);
                        console.log(await capsule.claimPregenWallet(pregenEmail));
                        updateToString();
                      }}
                    >
                      Claim Pregen Wallet
                    </Button>
                    <Button
                      colorScheme="teal"
                      onClick={async () => {
                        await capsule.setUserShare(pregenUserShare);
                        const formattedNumber = stringToPhoneNumber(pregenPhone);
                        console.log(await capsule.claimPregenWallets(formattedNumber, PregenIdentifierType.PHONE));
                        updateToString();
                      }}
                    >
                      Claim Pregen Wallet For Phone
                    </Button>

                    <Button colorScheme="teal" onClick={checkIsSessionActive}>
                      Is Fully Logged In?
                    </Button>
                    <Text>{isSessionActive ? 'Fully Logged In!' : 'Log In Pending...'}</Text>

                    <Text>
                      Wallet Address: <strong>{capsule.wallets[capsule.currentWalletIds?.[0]]?.address ?? 'none'}</strong>
                    </Text>
                    {/* <Text>{userShare}</Text> */}

                    <Input
                      placeholder="message-to-sign"
                      onChange={e => {
                        setMessageToSign(e.target.value);
                      }}
                      value={messageToSign || ''}
                    />
                    <Button colorScheme="teal" onClick={handleSignMessage}>
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
                      onClick={async () => {
                        const walletId = capsule.findWalletId(capsule.currentWalletIds[0], { scheme: NON_ED25519 });
                        const tx = await createTransaction(
                          txToAddress,
                          txValue,
                          txGasAmount,
                          txMaxPriorityFeePerGas,
                          txMaxFeePerGas,
                          nonce,
                          chainId,
                          smartContractAbi,
                          smartContractFunctionName,
                          smartContractFunctionArgs ? JSON.parse(smartContractFunctionArgs) : [],
                          smartContractByteCode,
                        );
                        const res = await capsule.sendTransaction(walletId, tx, `${chainId}`);
                        if ((res as DeniedSignatureResWithUrl).transactionReviewUrl) {
                          openPopup(
                            (res as DeniedSignatureResWithUrl).transactionReviewUrl,
                            'TransactionReview',
                            'REVIEW_TRANSACTION',
                          );
                        }

                        console.log(res);
                      }}
                    >
                      Send Transaction
                    </Button>
                    <Button
                      colorScheme="teal"
                      onClick={async () => {
                        await sendCosmosTx(capsule);
                      }}
                    >
                      Send Cosmos Transaction
                    </Button>
                    <Text>
                      Solana Signature: <strong>{ethersSignature}</strong>
                    </Text>
                    <Button
                      colorScheme="teal"
                      onClick={async () => {
                        await sendSolanaTx(capsule, setEthersSignature);
                      }}
                    >
                      Send Solana Transaction
                    </Button>
                    <Button
                      colorScheme="red"
                      onClick={async () => {
                        await capsule.logout();
                        await capsule.clearStorage();

                        updateToString();
                      }}
                    >
                      Logout and Clear Storage
                    </Button>
                  </>
                </VStack>
                <Box flexGrow={1} bg="#222" overflow="auto" maxH="100vh" position="sticky" top={0}>
                  <Box color="white" fontFamily={'monospace'} whiteSpace={'pre'} p={6} fontSize="14px">
                    {capsule.toString()}
                  </Box>
                </Box>
              </HStack>
            </VStack>
          )}
        </Container>
        <CapsuleModal
          isOpen={modalIsOpen}
          capsule={capsule}
          appName={(partners || []).find(({ apiKey }) => apiKey === selectedApiKey)?.displayName || 'Example'}
          onClose={handleOnClose}
          oAuthMethods={[
            OAuthMethod.GOOGLE,
            OAuthMethod.FACEBOOK,
            OAuthMethod.APPLE,
            OAuthMethod.TWITTER,
            OAuthMethod.DISCORD,
            OAuthMethod.FARCASTER,
          ]}
          onRampConfig={useOnRampConfig ? onRampConfig : undefined}
          networks={networks}
          twoFactorAuthEnabled
          theme={
            useTheme
              ? {
                  backgroundColor,
                  foregroundColor,
                  borderRadius,
                  font,
                  oAuthLogoVariant: logoVariant,
                }
              : undefined
          }
          logo={logo !== '' ? logo : undefined}
        />
      </ChakraProvider>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
