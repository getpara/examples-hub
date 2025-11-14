import { CpslButton, CpslText } from '@getpara/react-components';
import { useEffect, useState } from 'react';
import { styled } from 'styled-components';
import { usePara } from '../../../components/ParaContext.js';
import { useSearchParams } from 'react-router-dom';
import { isIFramed } from '../../../utils/isIFramed.js';
import { useCloseWindow } from '../../../hooks/useCloseWindow.js';
import { VerifyExternalWalletParams } from '@getpara/web-sdk';
import { ShieldHero } from '../../../components/ShieldHero.js';
import { useModalOutletContext } from '../../../hooks/useModalOutletContext.js';

interface ExternalWalletStepProps {
  onLogin: () => Promise<void>;
}

export const ExternalWallet = ({ onLogin }: ExternalWalletStepProps) => {
  const para = usePara();
  const [searchParams] = useSearchParams();
  const closeWindow = useCloseWindow();
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const sessionId = searchParams.get('sessionId') || '';
  const { trustedOrigin } = useModalOutletContext();

  useEffect(() => {
    const authInfo = para.authInfo;
    const externalWallet = authInfo.externalWallet;

    let hasRun = false;
    const setup = async () => {
      if (hasRun) return;
      hasRun = true;

      if (!externalWallet || !sessionId) {
        closeWindow();
        return;
      }

      const { message, code } = await para.ctx.client.sessionSIWEMessage(sessionId);
      setCode(code);

      (window.opener || window.parent)?.postMessage({ type: 'EW_TRIGGER_SIGN_MESSAGE', message }, trustedOrigin);
    };

    const handleMessage = async (event: MessageEvent) => {
      if (trustedOrigin !== '*' && event.origin !== trustedOrigin) {
        return; // Ignore messages from untrusted origins
      }

      if (event.data?.type === 'EW_SIGN_MESSAGE_ERROR') {
        setError(event.data.error);
        return;
      }
      if (event.data?.type === 'EW_SIGN_MESSAGE_SUCCESS') {
        const verifyExternalWalletParams: VerifyExternalWalletParams = event.data.verifyExternalWalletParams;

        try {
          const serverAuthState = await para.ctx.client.verifyExternalWallet(para.userId, {
            ...verifyExternalWalletParams,
            sessionLookupId: sessionId,
          });

          if (externalWallet.withFullParaAuth && serverAuthState.stage === 'done') {
            onLogin();
            (window.opener || window.parent)?.postMessage({ type: 'EW_VERIFY_SUCCESS', serverAuthState }, trustedOrigin);
          } else {
            (window.opener || window.parent)?.postMessage({ type: 'EW_VERIFY_SUCCESS', serverAuthState }, trustedOrigin);
            closeWindow();
          }
        } catch (e) {
          setError('Signature verification failed.');
          console.error('Error verifying signature:', e);
        }
        return;
      }
    };

    window?.addEventListener('message', handleMessage);

    setup();

    return () => {
      window?.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleRetry = async () => {
    setError(undefined);
    // Reload the SIWE message here to ensure we are triggering to sign the latest message
    const { message, code } = await para.ctx.client.sessionSIWEMessage(sessionId);
    setCode(code);
    (window.opener || window.parent)?.postMessage({ type: 'EW_VERIFY_RETRY', message }, trustedOrigin);
  };

  return (
    <Container $isEmbedded={isIFramed}>
      <InnerContainer>
        <ShieldHero />
        <CpslText variant="bodyL" weight="semiBold">
          Wallet Security Code
        </CpslText>
        <CpslText variant="bodyS" color="secondary" weight="medium" align="center">
          Make sure the following code matches the code in the message your wallet is asking you to sign.
        </CpslText>
      </InnerContainer>
      <CpslText variant="headingS" weight="semiBold">
        {code}
      </CpslText>
      {error && (
        <>
          <CpslText variant="bodyS" weight="medium" align="center" color="error">
            {error}
          </CpslText>
          <CpslButton onClick={handleRetry}>Retry</CpslButton>
        </>
      )}
    </Container>
  );
};

const Container = styled.form<{ $isEmbedded?: boolean }>`
  flex: 1;
  box-sizing: border-box;
  width: 100%;
  overflow: hidden;

  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 24px;

  padding: 24px 16px;
`;

const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;
