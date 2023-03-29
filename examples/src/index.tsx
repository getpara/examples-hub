import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import {
  Button,
  Container,
  Input,
} from '@chakra-ui/react';
import QRCode from 'react-qr-code'
import Capsule, { Environment } from '@capsule/web-sdk';

const App = () => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [webAuthURLForCreate, setWebAuthURLForCreate] = useState('');
  let capsule: Capsule | undefined;

  async function initCapsule(email: string) {
    capsule = new Capsule(Environment.SANDBOX, email);
    await capsule.createUser();
  }

  return (
    <Container maxW="ld" padding={10}>
      <Input placeholder="e-mail" onChange={(e) => setEmail(e.target.value)} value={email}/>
      <Button colorScheme="teal" onClick={async () => initCapsule(email)}>Create Account</Button>
      <Input placeholder="verification-code" onChange={(e) => setVerificationCode(e.target.value)} value={verificationCode}/>
      <Button colorScheme="teal" onClick={async () => {
        const url = await capsule.verifyEmail(verificationCode);
        setWebAuthURLForCreate(url);
      }}>Verify Email</Button>
      <a href={webAuthURLForCreate}>
        <QRCode value={webAuthURLForCreate}/>
      </a>
    </Container>
  )
};

ReactDOM.render(<App />, document.getElementById('root'));
