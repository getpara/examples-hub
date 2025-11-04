import { useModal } from '@getpara/react-sdk';
import React from 'react';
import Button from '../base/Button';

const ConnectButton = () => {
  const { openModal } = useModal();

  return <Button onClick={openModal}>Log in</Button>;
};

export default ConnectButton;
