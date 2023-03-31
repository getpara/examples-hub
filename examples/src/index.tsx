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
import Capsule, { Environment } from '@capsule/web-sdk';

function App() {
  const capsule = new Capsule(Environment.SANDBOX);

  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [webAuthURLForCreate, setWebAuthURLForCreate] = useState('');
  const [webAuthURLForLogin, setWebAuthURLForLogin] = useState('');
  const [isSessionActive, setIsSessionActive] = useState(false);

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
          }} value={email || capsule.getEmail() || ''}/>
          <Button colorScheme="teal" onClick={async () => {
            capsule.clearStorage();
            capsule.setEmail(email);
            await capsule.createUser();
          }}>Create Account</Button>

          <Input placeholder="verification-code" onChange={(e) => setVerificationCode(e.target.value)} value={verificationCode}/>
          <Button colorScheme="teal" onClick={async () => {
            setWebAuthURLForCreate(await capsule.verifyEmail(verificationCode));
          }}>Verify Email</Button>
          {
            webAuthURLForCreate && <a href={webAuthURLForCreate} rel="noreferrer" target="_blank">
              <QRCode value={webAuthURLForCreate}/>
            </a>
          }

          <Button colorScheme="teal" onClick={checkIsSessionActive}>Is Fully Logged In?</Button>
          <Text>{isSessionActive ? 'Fully Logged In!' : 'Log In Pending...'}</Text>

          <Button colorScheme="teal" onClick={async () => {
             await capsule.createWallet();
          }}>Create Wallet</Button>
          <Text>Wallet Address: {capsule.getWallets()?.[Object.keys(capsule.getWallets())[0]]?.address}</Text>

          <Button colorScheme="teal" onClick={async () => {
            await capsule.logout();
            capsule.clearStorage();
          }}>Logout and Clear Storage</Button>

          <Button colorScheme="teal" onClick={async () => {
            capsule.clearStorage();
            capsule.setEmail(email);
            setWebAuthURLForLogin(await capsule.initiateUserLogin());
          }}>Login</Button>
          {
            webAuthURLForLogin && <a href={webAuthURLForLogin} rel="noreferrer" target="_blank">
              <QRCode value={webAuthURLForLogin}/>
            </a>
          }
          <Button colorScheme="teal" onClick={async () => {
            await capsule.setupAfterLogin();
          }}>Setup After Login</Button>
        </VStack>
      </Container>
    </ChakraProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
