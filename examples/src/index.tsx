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
import Capsule, { Environment } from './library';
import Web3 from 'web3';
import { Transaction } from '@ethereumjs/tx';
import { Common } from '@ethereumjs/common'

const DEFAULT_TO_ADDRESS = '0x42C9a72C9dfCc92CAe0de9510160cEa2Da27Af91';
const DEFAULT_VALUE = '1000';
const DEFAULT_GAS_AMOUNT = '21000';
const DEFAULT_GAS_PRICE = '100';
const DEFAULT_NONCE = '0';
// goerli chain id
const DEFAULT_CHAIN_ID = '5';
const web3 = new Web3();

function createTransaction(toAddress: string, value: string, gasAmount: string, gasPrice: string, nonce: string, chainId: string): string {
  const tx = new Transaction({
    to: toAddress,
    value: web3.utils.toHex(web3.utils.toWei(value, 'gwei')),
    gasLimit: web3.utils.toHex(Number(gasAmount)),
    gasPrice: web3.utils.toHex(web3.utils.toWei(gasPrice, 'gwei')),
    nonce: web3.utils.toHex(Number(nonce)),
  }, { common: new Common({ chain: Number(chainId) }) });
  return tx.serialize().toString('base64');
}

const capsule = new Capsule(Environment.SANDBOX);

function App() {
  const [email, setEmail] = useState(capsule.getEmail());
  const [verificationCode, setVerificationCode] = useState('');
  const [webAuthURLForCreate, setWebAuthURLForCreate] = useState('');
  const [webAuthURLForLogin, setWebAuthURLForLogin] = useState('');
  const [isSessionActive, setIsSessionActive] = useState(false);

  const [txToAddress, setTxToAddress] = useState(DEFAULT_TO_ADDRESS);
  const [txValue, setTxValue] = useState(DEFAULT_VALUE);
  const [txGasAmount, setTxGasAmount] = useState(DEFAULT_GAS_AMOUNT);
  const [txGasPrice, setTxGasPrice] = useState(DEFAULT_GAS_PRICE);
  const [nonce, setNonce] = useState(DEFAULT_NONCE);
  const [chainId, setChainId] = useState(DEFAULT_CHAIN_ID);

  async function checkIsSessionActive() {
    const isSessionActive = await capsule.isSessionActive();
    setIsSessionActive(isSessionActive);
  }

  return (
    <ChakraProvider>
      <Container maxW="ld" padding={10}>
        <VStack align="left" spacing={5}>
          <Input placeholder="e-mail" onChange={(e) => {
            setEmail(e.target.value)
          }} value={email || ''}/>
          <Button colorScheme="teal" onClick={async () => {
            capsule.clearStorage();
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
             await capsule.createWallet();
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
          <Text>Gas Price (gwei):</Text>
          <Input name='Gas Price (gwei)' onChange={(e) => setTxGasPrice(e.target.value)} value={txGasPrice}/>
          <Text>Nonce:</Text>
          <Input name='Nonce' onChange={(e) => setNonce(e.target.value)} value={nonce}/>
          <Text>Chain ID:</Text>
          <Input name='Chain ID' onChange={(e) => setChainId(e.target.value)} value={chainId}/>

          <Button colorScheme="teal" onClick={async () => {
            const walletId = capsule.getWallets()?.[Object.keys(capsule.getWallets())[0]]?.id;
            const tx = createTransaction(txToAddress, txValue, txGasAmount, txGasPrice, nonce, chainId);
            await capsule.sendTransaction(walletId, tx, `${chainId}`);
          }}>Send Transaction</Button>

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
