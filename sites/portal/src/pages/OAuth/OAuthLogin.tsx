import { useEffect, useState } from 'react';
import { usePara } from '../../components/ParaContext';
import { CpslButton, CpslIcon } from '@getpara/react-components';
import styled from 'styled-components';
import { useParams, useSearchParams } from 'react-router-dom';
import { TOAuthMethod } from '@getpara/user-management-client';
import { ModalLoading } from '../../components';

export const OAuthLogin = () => {
  const para = usePara();
  const { method } = useParams();
  const [searchParams] = useSearchParams();
  const [isWaiting, setIsWaiting] = useState(false);

  const handleOAuthLogin = async () => {
    setIsWaiting(true);
    try {
      const oAuthUrl = await para.getOAuthUrl({
        method: method as Exclude<TOAuthMethod, 'TELEGRAM' | 'FARCASTER'>,
        sessionLookupId: searchParams.get('sessionId') || undefined,
        appScheme: searchParams.get('appScheme') || undefined,
        encryptionKey: searchParams.get('encryptionKey') || undefined,
      });

      // Add nativeCallbackUrl as a query parameter if it exists
      const nativeCallbackUrl = searchParams.get('nativeCallbackUrl');
      let finalUrl = oAuthUrl;
      if (oAuthUrl && nativeCallbackUrl) {
        const url = new URL(oAuthUrl);
        url.searchParams.set('nativeCallbackUrl', nativeCallbackUrl);
        finalUrl = url.toString();
      }

      if (finalUrl) {
        window.location.href = finalUrl;
      } else {
        setIsWaiting(false);
      }
    } catch (error) {
      console.error('Error getting OAuth URL:', error);
      setIsWaiting(false);
    }
  };

  useEffect(() => {
    handleOAuthLogin();
  }, [searchParams]);

  return (
    <Container>
      {isWaiting ? (
        <ModalLoading noText />
      ) : (
        <CpslButton onClick={handleOAuthLogin} variant="secondary">
          <CpslIcon slot="start" icon="refresh" />
          Try again
        </CpslButton>
      )}
    </Container>
  );
};

const Container = styled.div`
  background-color: transparent !important;
  width: 100%;
  height: 100%;
  display: flex;
  gap: 24px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
