import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '.';
import { useAtom } from 'jotai';
import { resetConfigAtom } from '../../atoms';
import { useClient } from '@getpara/react-sdk';

export const AccountActionButtons: React.FC = () => {
  const para = useClient();
  const [, resetConfig] = useAtom(resetConfigAtom);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = async () => {
    try {
      await para?.logout({ clearPregenWallets: true });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleDeleteAndReset = async () => {
    setIsDeleting(true);
    try {
      if (para?.userId) {
        try {
          await para?.ctx.client.deleteSelf(para.userId);
        } catch (error: any) {
          throw new Error(`Failed to delete account: ${error.message}`);
        }
      }
      await handleLogout();
      resetConfig(null);
    } catch (error) {
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ButtonContainer>
      <Button variant="secondary" onClick={handleLogout}>
        Log Out
      </Button>
      <Button variant="secondary" onClick={handleDeleteAndReset} disabled={isDeleting}>
        {isDeleting ? 'Deleting...' : 'Delete Account & Reset Demo'}
      </Button>
    </ButtonContainer>
  );
};

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
`;
