import { CpslButton, CpslText } from '@getpara/react-components';
import { ShieldHero } from '../../components/ShieldHero';
import { styled } from 'styled-components';
import { useEffect, useState } from 'react';
import { useModalOutletContext } from '../../hooks/useModalOutletContext';

export const ConnectExternalWallet = () => {
  const [error, setError] = useState<string>();
  const { trustedOrigin } = useModalOutletContext();

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (trustedOrigin !== '*' && event.origin !== trustedOrigin) {
        return; // Ignore messages from untrusted origins
      }

      if (event.data?.type === 'EW_CONNECT_ERROR') {
        setError(event.data.error);
        return;
      }
      if (event.data?.type === 'EW_CONNECT_RETRY') {
        setError(undefined);
        return;
      }
    };

    window?.addEventListener('message', handleMessage);

    return () => {
      window?.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleRetry = () => {
    setError(undefined);
    (window.opener || window.parent)?.postMessage({ type: 'EW_CONNECT_RETRY' }, trustedOrigin);
  };

  return (
    <Container>
      <InnerContainer>
        <ShieldHero />
        <CpslText variant="bodyL" weight="semiBold" align="center">
          Confirm Connection Request
        </CpslText>
        <CpslText variant="bodyS" weight="medium" align="center" color="secondary">
          Complete the connection request using your wallet.
        </CpslText>
        {error && (
          <>
            <CpslText variant="bodyS" weight="medium" align="center" color="error">
              {error}
            </CpslText>
            <CpslButton onClick={handleRetry}>Retry</CpslButton>
          </>
        )}
      </InnerContainer>
    </Container>
  );
};

const Container = styled.div`
  padding: 24px 16px;
  display: flex;
  flex: 1;
  width: 100%;
  justify-content: center;
  background-color: var(--cpsl-color-background-0);
`;

const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;
