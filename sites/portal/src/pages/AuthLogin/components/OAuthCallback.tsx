import { useEffect } from 'react';
import { ModalLoading } from '../../../components';
import { useSearchParams } from 'react-router-dom';
import { useCloseWindow } from '../../../hooks/useCloseWindow';
import { styled } from 'styled-components';

interface OAuthCallbackStepProps {
  onLogin: () => Promise<void>;
}

export const OAuthCallback = ({ onLogin }: OAuthCallbackStepProps) => {
  const [searchParams] = useSearchParams();
  const closeWindow = useCloseWindow();

  const handleOAuthCallback = async () => {
    try {
      await onLogin();
    } catch (error) {
      console.error('Error:', error);
      closeWindow();
    }
  };

  useEffect(() => {
    handleOAuthCallback();
  }, [searchParams]);

  return (
    <Container>
      <ModalLoading noText />
    </Container>
  );
};

const Container = styled.div`
  background-color: transparent !important;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
