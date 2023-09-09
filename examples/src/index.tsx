import React, { useState } from 'react';
import { useSessionStorage } from 'react-use';
import ReactDOM from 'react-dom/client';
import {
  Button,
  ChakraProvider,
  Container,
  HStack,
  Input,
  Select,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useDebounce } from 'use-debounce'
import QRCode from 'react-qr-code';
import Web3 from 'web3';
import { http, parseEther } from 'viem'
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

import Capsule, { Environment, DeniedSignatureResWithUrl } from './library';
import { FeeMarketEIP1559Transaction } from '@ethereumjs/tx';
import {CapsuleButton} from './library/modal/CapsuleModal';
import {
  CapsuleProtoSigner,
  CapsuleEthersSigner,
  createCapsuleViemClient,
  CapsuleEIP1193Provider,
  CapsuleConnector,
  CapsuleWeb,
} from './library';
import { CoreCapsule } from './library/CoreCapsule';
import { ConstructorOpts } from './library/Capsule';

// sample transaction params
const DEFAULT_TO_ADDRESS = '0x42c9a72c9dfcc92cae0de9510160cea2da27af91';
const DEFAULT_VALUE = '1000';
const DEFAULT_GAS_AMOUNT = '21000';
const DEFAULT_MAX_PRIORITY_FEE_PER_GAS = '1';
const DEFAULT_MAX_FEE_PER_GAS = '3';
const DEFAULT_NONCE = '0';
const API_KEY_WITH_PERMISSIONS = 'fdba16e45ba41e80185eb2c0195e89d4';
const API_KEY_WITH_BRANDING = '2f938ac0c48ef356050a79bd66042a23';

const ALCHEMY_SEPOLIA_PROVIDER = 'https://eth-sepolia.g.alchemy.com/v2/KfxK8ZFXw9mTUuJ7jt751xGJCa3r8noZ';
const WSS_ALCHEMY_SEPOLIA_PROVIDER = 'wss://eth-sepolia.g.alchemy.com/v2/HfT9dMNs3W0h1vJmiPZQ_APaFjPo-BF9';
// goerli chain id
const DEFAULT_CHAIN_ID = '11155111';
const DEFAULT_CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "retrieve",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "num",
        "type": "uint256"
      }
    ],
    "name": "store",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
const DEFAULT_SMART_CONTRACT_FUNCTION = 'store';
const DEFAULT_SMART_CONTRACT_ARGS = ['808'];
const COSMOS_TESTNET_RPC = 'rpc.sentry-01.theta-testnet.polypore.xyz';
const COSMOS_DEFAULT_TO_ADDRESS = 'cosmos1f3px9t4juk43cwufj7f9s64z3wj7xvyc0rexg6';
const web3 = new Web3();

// use below to call "view" smart contract function
// const web3 = new Web3('https://eth-sepolia.g.alchemy.com/v2/demo');
// use below to deploy smart contract associated with default abi
// const DEFAULT_DEPLOY_CONTRACT_BYTECODE = '0x608060405234801561001057600080fd5b50610150806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80632e64cec11461003b5780636057361d14610059575b600080fd5b610043610075565b60405161005091906100a1565b60405180910390f35b610073600480360381019061006e91906100ed565b61007e565b005b60008054905090565b8060008190555050565b6000819050919050565b61009b81610088565b82525050565b60006020820190506100b66000830184610092565b92915050565b600080fd5b6100ca81610088565b81146100d557600080fd5b50565b6000813590506100e7816100c1565b92915050565b600060208284031215610103576101026100bc565b5b6000610111848285016100d8565b9150509291505056fea2646970667358221220322c78243e61b783558509c9cc22cb8493dde6925aa5e89a08cdf6e22f279ef164736f6c63430008120033';
// below is address of existing smart contract on sepolia
// const DEFAULT_CONTRACT_ADDRESS = '0xc08c00e1aa97a18583dc1a72a7e9fb9ce56cfef5'

async function sendCosmosTx(): Promise<void> {
  const protoSigner = new CapsuleProtoSigner(capsule);
  const client = await SigningStargateClient.connectWithSigner(COSMOS_TESTNET_RPC, protoSigner);

  console.log(await client.getAccount(protoSigner.address));
  console.log(await client.getAllBalances(protoSigner.address))
  const fromAddress = protoSigner.address;

  console.log(
    await client.sendTokens(
      fromAddress,
      COSMOS_DEFAULT_TO_ADDRESS,
      [{
        denom: 'uatom',
        amount: '9500',
      }],
      {
        amount: [{
          amount: '500',
          denom: 'uatom',
        }],
        gas: '200000',
      },
    ),
  );
}

async function sendViemTransaction(nonce = 0): Promise<void> {
  const viemClient = createCapsuleViemClient(capsule, {
    chain: sepolia,
    transport: http(ALCHEMY_SEPOLIA_PROVIDER),
  });
  console.log(await viemClient.sendTransaction({
    value: BigInt(10100000000),
    to: DEFAULT_TO_ADDRESS,
    chain: sepolia,
    gas: BigInt(21000),
    maxPriorityFeePerGas: BigInt(1000000000),
    maxFeePerGas: BigInt(3000000000),
    account: viemClient.account,
    nonce,
  }));
}

async function sendEIP1193ProviderTransaction(): Promise<void> {
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
  console.log(accounts)
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
  console.log(await eip1193Provider.request({
    method: 'eth_sendTransaction',
    params: [tx],
  }));
}

function WagmiSignMessage(): JSX.Element {
  const [message, setMessage] = useState<string>('');
  const [messageSignature, setMessageSignature] = useState<string | undefined>();
  const onSuccess = (data: string) => {
    setMessageSignature(data)
  };
  const { signMessageAsync } = useSignMessage({ onSuccess });
  return (
    <>
      <Input placeholder="message to sign" onChange={(e) => {
        setMessage(e.target.value);
      }}/>
      {messageSignature && <Text>Message Signature: {messageSignature}</Text>}
      <Button isDisabled={!message} onClick={async () => {
        await signMessageAsync({ message });
      }}>Sign Message</Button>
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
      <Input value={toAddress} onChange={(e) => {
        setToAddress(e.target.value);
      }}/>
      <Text>Value in gwei:</Text>
      <Input value={amount} onChange={(e) => {
        setAmount(e.target.value);
      }}/>
      <Button isDisabled={isSendTxLoading || isWaitTxLoading || !sendTransaction || !toAddress || !amount} onClick={() => {
        sendTransaction();
      }}>{isSendTxLoading ? 'Sending Transaction...' : isWaitTxLoading ? 'Awaiting Confirmation...' : 'Send Transaction'}</Button>
      {isSuccess && (
        <Text>
          <a rel="noreferrer" target="_blank" href={`https://sepolia.etherscan.io/tx/${data?.hash}`}><u>Sepolia Scan Link</u></a>
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
          <Button color="red.600" backgroundColor="white" onClick={() => {
            disconnect();
          }}>Disconnect</Button>
        </VStack>
        <WagmiSignMessage />
        <WagmiSendTransaction />
      </>
    );
  }

  return (
    <VStack backgroundColor="blue.400" padding={6}>
      {connectors.map((connector) => (
        <Button
          color="purple"
          backgroundColor="white"
          disabled={!connector.ready}
          key={connector.id}
          onClick={() => connect({ connector })}
        >
          {connector.name}
          {!connector.ready && ' (unsupported)'}
          {isLoading &&
            connector.id === pendingConnector?.id &&
            ' (connecting)'}
        </Button>
      ))}
 
      {error && <Text>{error.message}</Text>}
    </VStack>
  );
}

function WagmiComponent(): JSX.Element {
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

async function sendEthersTransaction(): Promise<void> {
  const tx = {
    from: Object.values(capsule.getWallets())[0]?.address,
    to: DEFAULT_TO_ADDRESS,
    value: 1010000000,
    gasLimit: 21000,
    maxPriorityFeePerGas: 1000000000,
    maxFeePerGas: 3000000000,
    nonce: 0,
    chainId: DEFAULT_CHAIN_ID,
    type: 2,
  };
  const provider = new ethers.JsonRpcProvider(ALCHEMY_SEPOLIA_PROVIDER, 'sepolia')
  const ethersSigner = new CapsuleEthersSigner(capsule, provider);
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

function getCapsuleOpts(env: Environment): ConstructorOpts {
  switch (env) {
    case Environment.DEV:
      return {
        offloadMPCComputationURL: 'http://localhost:9009',
      };
    case Environment.SANDBOX:
      return {
        // useLocalFiles: true,
        offloadMPCComputationURL: 'https://partner-mpc-computation.sandbox.usecapsule.com',
        // portalBackgroundColor: '#df092d',
        // portalPrimaryButtonColor: '#322e47',
        // portalTextColor: '#ffffff',
      };
    case Environment.BETA:
      return {
        offloadMPCComputationURL: 'https://partner-mpc-computation.beta.usecapsule.com',
      };
    case Environment.PROD:
      return {
        offloadMPCComputationURL: 'https://partner-mpc-computation.prod.usecapsule.com',
      };
    default:
      throw new Error(`invalid environment: ${env}`);
  }
}

let capsule: Capsule | CoreCapsule = undefined;

function App() {
  const [selectedView, setSelectedView] = useSessionStorage('@EXAMPLE-CAPSULE/selectedView', 'OLD_VIEW');
  const [selectedEnv, setSelectedEnv] = useSessionStorage('@EXAMPLE-CAPSULE/selectedEnv', Environment.SANDBOX);
  const [selectedApiKey, setSelectedApiKey] = useSessionStorage('@EXAMPLE-CAPSULE/selectedApiKey', undefined);
  const [selectedCapsuleClass, setSelectedCapsuleClass] = useSessionStorage('@EXAMPLE-CAPSULE/selectedCapsuleClass', 'CAPSULE');

  capsule = selectedCapsuleClass === 'CAPSULE_WEB' ?
    new CapsuleWeb(selectedEnv, selectedApiKey, getCapsuleOpts(selectedEnv)):
    new Capsule(selectedEnv, selectedApiKey, getCapsuleOpts(selectedEnv));

  const [email, setEmail] = useState(capsule.getEmail());
  const [verificationCode, setVerificationCode] = useState('');
  const [webAuthURLForCreate, setWebAuthURLForCreate] = useState('');
  const [webAuthURLForLogin, setWebAuthURLForLogin] = useState('');
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
  const [transactionReviewUrl, setTransactionReviewUrl] = useState('');

  const [modalIsOpen, setModalIsOpen] = useState(false);

  async function checkIsSessionActive() {
    const isSessionActive = await capsule.isFullyLoggedIn();
    setIsSessionActive(isSessionActive);
  }

  return (
    <ChakraProvider>
      <Container maxW="ld" padding={10}>
        <HStack paddingBottom={5}>
          <Text width={'15%'}><strong>Select Environment:</strong></Text>
          <Select defaultValue={selectedEnv} onChange={e => setSelectedEnv(e.target.value as Environment)}>
            <option value={Environment.DEV}>Dev</option>
            <option value={Environment.SANDBOX}>Sandbox</option>
            <option value={Environment.BETA}>Beta</option>
            <option value={Environment.PROD}>Prod</option>
          </Select>
        </HStack>
        <HStack paddingBottom={5}>
          <Text width={'15%'}><strong>Select Example View:</strong></Text>
          <Select defaultValue={selectedView} onChange={e => setSelectedView(e.target.value)}>
            <option value="OLD_VIEW">Old View</option>
            {/* <option value="ETHERS">Ethers</option>
            <option value="VIEM">Viem</option> */}
            <option value="WAGMI">Wagmi View</option>
          </Select>
        </HStack>
        <HStack paddingBottom={10}>
        <Text width={'15%'}><strong>Set API Key:</strong></Text>
          <Input placeholder="api key" onChange={(e) => {
            setSelectedApiKey(e.target.value)
          }} value={selectedApiKey || ''}/>
        </HStack>
        <HStack paddingBottom={5}>
          <Text width={'15%'}><strong>Select Capsule Class:</strong></Text>
          <Select defaultValue={selectedCapsuleClass} onChange={e => setSelectedCapsuleClass(e.target.value)}>
            <option value={'CAPSULE'}>Capsule</option>
            <option value={'CAPSULE_WEB'}>Capsule Web (new sdk refactored class)</option>
          </Select>
        </HStack>
        {selectedView === 'WAGMI' && (
          <VStack align="left" spacing={5}>
            <WagmiComponent />
          </VStack>
        )}
        {selectedView === 'OLD_VIEW' && (
          <VStack align="left" spacing={5}>
            <Button colorScheme="green" onClick={()=>{setModalIsOpen(true)}}>Open Modal</Button>
            <CapsuleButton capsule={capsule} appName="Example"/>
            <Input placeholder="e-mail" onChange={(e) => {
              setEmail(e.target.value)
            }} value={email || ''}/>
            <Button colorScheme="teal" onClick={async () => {
              capsule.clearStorage(true);
              await capsule.createUser(email);
            }}>Create Account</Button>

            <Input placeholder="verification-code" onChange={(e) => setVerificationCode(e.target.value)} value={verificationCode}/>
            <Button colorScheme="teal" onClick={async () => {
              setWebAuthURLForCreate(await capsule.verifyEmail(verificationCode));
            }}>Verify Email</Button>
            {
              webAuthURLForCreate && !isSessionActive && <a href={webAuthURLForCreate} rel="noreferrer" target="_blank">
                <QRCode value={webAuthURLForCreate}/>
              </a>
            }

            <Button colorScheme="teal" onClick={checkIsSessionActive}>Is Fully Logged In?</Button>
            <Text>{isSessionActive ? 'Fully Logged In!' : 'Log In Pending...'}</Text>

            <Button colorScheme="teal" onClick={async () => {
              // eslint-disable-next-line
              await capsule.createWallet(false, () => {});
            }}>Create Wallet</Button>
            <Text>Wallet Address: <strong>{capsule.getWallets()?.[Object.keys(capsule.getWallets())[0]]?.address}</strong></Text>

            <Button colorScheme="teal" onClick={async () => {
              capsule.clearStorage();
              setWebAuthURLForLogin(await capsule.initiateUserLogin(email));
            }}>Login</Button>
            {
              webAuthURLForLogin && !isSessionActive && <a href={webAuthURLForLogin} rel="noreferrer" target="_blank">
                <QRCode value={webAuthURLForLogin}/>
              </a>
            }
            <Button colorScheme="teal" onClick={async () => {
              await capsule.setupAfterLogin();
            }}>Setup After Login</Button>

            <Text>To Address:</Text>
            <Input name='To Address' onChange={(e) => setTxToAddress(e.target.value)} value={txToAddress}/>
            <Text>Value (gwei):</Text>
            <Input name='Value (gwei)' onChange={(e) => setTxValue(e.target.value)} value={txValue}/>
            <Text>Gas Amount:</Text>
            <Input name='Gas Amount' onChange={(e) => setTxGasAmount(e.target.value)} value={txGasAmount}/>
            <Text>Max Priority Fee Per Gas (gwei):</Text>
            <Input name='Max Priority Fee Per Gas (gwei)' onChange={(e) => setTxMaxPriorityFeePerGas(e.target.value)} value={txMaxPriorityFeePerGas}/>
            <Text>Max Fee Per Gas (gwei):</Text>
            <Input name='Max Fee Per Gas (gwei)' onChange={(e) => setTxMaxFeePerGas(e.target.value)} value={txMaxFeePerGas}/>
            <Text>Nonce:</Text>
            <Input name='Nonce' onChange={(e) => setNonce(e.target.value)} value={nonce}/>
            <Text>Chain ID:</Text>
            <Input name='Chain ID' onChange={(e) => setChainId(e.target.value)} value={chainId}/>
            <Text>Smart Contract ABI:</Text>
            <Input name='Smart Contract ABI' onChange={(e) => setSmartContractAbi(e.target.value)} value={smartContractAbi}/>
            <Text>Smart Contract Function Name:</Text>
            <Input name='Smart Contract Function Name' onChange={(e) => setSmartContractFunctionName(e.target.value)} value={smartContractFunctionName} placeholder={DEFAULT_SMART_CONTRACT_FUNCTION}/>
            <Text>Smart Contract Function Args:</Text>
            <Input name='Smart Contract Function Args' onChange={(e) => setSmartContractFunctionArgs(e.target.value)} value={smartContractFunctionArgs} placeholder={JSON.stringify(DEFAULT_SMART_CONTRACT_ARGS)}/>
            <Text>Smart Contract Byte Code:</Text>
            <Input name='Smart Contract Byte Code' onChange={(e) => setSmartContractByteCode(e.target.value)} value={smartContractByteCode}/>

            <Button colorScheme="teal" onClick={async () => {
              const walletId = capsule.getWallets()?.[Object.keys(capsule.getWallets())[0]]?.id;
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
                setTransactionReviewUrl((res as DeniedSignatureResWithUrl).transactionReviewUrl);
              }
            }}>Send Transaction</Button>
            {transactionReviewUrl && <Text>Transaction Review URL is: {transactionReviewUrl}</Text>}

            <Button colorScheme="red" onClick={async () => {
              await capsule.logout();
              capsule.clearStorage();
            }}>Logout and Clear Storage</Button>
          </VStack>
        )}
      </Container>
    </ChakraProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
