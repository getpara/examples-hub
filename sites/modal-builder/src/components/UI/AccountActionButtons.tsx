import React from 'react';
import styled from 'styled-components';
import { Button } from '.';
import { useAtom } from 'jotai';
import { checkLoginStatusAtom, resetConfigAtom } from '../../atoms';
import { useClient } from '@getpara/react-sdk';

export const AccountActionButtons: React.FC = () => {
  const para = useClient();
  const [, checkLoginStatus] = useAtom(checkLoginStatusAtom);
  const [, resetConfig] = useAtom(resetConfigAtom);

  const handleLogout = async () => {
    try {
      await para?.logout();
      checkLoginStatus(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  const handleDeleteAndReset = async () => {
    try {
      resetConfig(null);
      await handleLogout();
      await para?.ctx.client.deleteSelf(para?.getUserId()!);
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  return (
    <ButtonContainer>
      <Button variant="secondary" onClick={handleLogout}>
        Log out
      </Button>
      <Button variant="secondary" onClick={handleDeleteAndReset}>
        Delete account & Reset demo
      </Button>
    </ButtonContainer>
  );
};

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
`;
