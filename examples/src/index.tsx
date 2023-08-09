import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import {
  Button,
  ChakraProvider,
  Container,
  Input,
  Text,
  VStack,
} from '@chakra-ui/react';
import QRCode from 'react-qr-code';
import Web3 from 'web3';
import { http } from 'viem'
import { sepolia } from 'viem/chains';
import { SigningStargateClient } from '@cosmjs/stargate';
import { ethers } from 'ethers';

import Capsule, { Environment, DeniedSignatureResWithUrl } from './library';
import { FeeMarketEIP1559Transaction } from '@ethereumjs/tx';
import {CapsuleButton, CapsuleModal} from './library/modal/CapsuleModal';
import { CapsuleProtoSigner } from './library';
import { CapsuleEthersSigner } from './library';
import { createCapsuleViemClient } from './library';

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
    value: BigInt(101000000000),
    to: DEFAULT_TO_ADDRESS,
    chain: sepolia,
    gas: BigInt(21000),
    maxPriorityFeePerGas: BigInt(1000000000),
    maxFeePerGas: BigInt(3000000000),
    account: viemClient.account,
    nonce,
    type: 'eip1559',
  }));
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

const capsule = new Capsule(Environment.SANDBOX, undefined, {
  // useLocalFiles: true,
  offloadMPCComputationURL: 'https://partner-mpc-computation.sandbox.usecapsule.com',
  // portalBackgroundColor: '#df092d',
  // portalPrimaryButtonColor: '#322e47',
  // portalTextColor: '#ffffff',
});

function App() {
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
        <VStack align="left" spacing={5}>
          <Button colorScheme="green" onClick={()=>{setModalIsOpen(true)}}>Open Modal</Button>
          <CapsuleButton capsule={capsule} appName="Example"/>
          {/*<CapsuleModal capsule={capsule} isOpen={modalIsOpen} onClose={() => {setModalIsOpen(false)}} onRampAvailable/>*/}
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
      </Container>
    </ChakraProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
