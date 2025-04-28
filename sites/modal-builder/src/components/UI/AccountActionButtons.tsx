import React from 'react';
import styled from 'styled-components';
import { Button } from '.';
import { useAtom } from 'jotai';
import { resetConfigAtom } from '../../atoms';
import { useClient } from '@getpara/react-sdk';

export const AccountActionButtons: React.FC = () => {
  const para = useClient();
  const [, resetConfig] = useAtom(resetConfigAtom);

  const handleLogout = async () => {
    try {
      await para?.logout({ clearPregenWallets: true });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  const handleDeleteAndReset = async () => {
    try {
      resetConfig(null);
      await handleLogout();
      if (para?.userId) {
        await para?.ctx.client.deleteSelf(para.userId);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  return (
    <ButtonContainer>
      <Button variant="secondary" onClick={handleLogout}>
        Log Out
      </Button>
      <Button variant="secondary" onClick={handleDeleteAndReset}>
        Delete Account & Reset Demo
      </Button>
    </ButtonContainer>
  );
};

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
`;
