import { useEffect, useState } from 'react';
import { usePara } from '../../components/ParaContext';
import { CpslButton, CpslIcon, CpslSpinner, CpslText } from '@getpara/react-components';
import styled from 'styled-components';
import { TelegramAuthResponse } from '@getpara/user-management-client';
import { Environment } from '@getpara/web-sdk';
import { useSearchParams } from 'react-router-dom';
import { isIFramed } from '../../utils/isIFramed';
import { SpinnerContainer } from '@getpara/react-common';
import { useModalOutletContext } from '../../hooks/useModalOutletContext';

interface Options {
  bot_id: string;
  request_access?: boolean;
  lang?: string;
}

type Callback = (dataOrFalse: TelegramAuthResponse | false) => void;

declare global {
  interface Window {
    Telegram?: {
      Login: {
        auth: (options: Options, callback: Callback) => void;
      };
    };
  }
}

type TelegramLoginProps = {
  onLogin?: () => Promise<void>;
};

export function TelegramLogin({ onLogin }: TelegramLoginProps) {
  const para = usePara();
  const [isWaiting, setIsWaiting] = useState(false);
  const [isSecondAttempt, setIsSecondAttempt] = useState(false);
  const [searchParams] = useSearchParams();
  const { trustedOrigin } = useModalOutletContext();

  const shouldVerify = !!onLogin;

  const botId = (() => {
    switch (para.ctx.env) {
      case Environment.PROD:
        return '7643995807';
      case Environment.BETA:
        return '7788006052';
      case Environment.SANDBOX:
        return '7552159413';
      case Environment.DEV:
      default:
        return '8145911241';
    }
  })();

  const onClick = () => {
    setIsWaiting(true);
    window?.parent?.postMessage({ type: 'TELEGRAM_LOGIN' }, trustedOrigin);

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script['data-telegram-login'] = `${botId}`;
    script.onload = () => {
      window.Telegram?.Login.auth({ bot_id: `${botId}`, request_access: true }, async data => {
        if (!data) {
          window?.parent?.postMessage({ type: 'TELEGRAM_FAILED' }, trustedOrigin);
          setIsWaiting(false);
          setIsSecondAttempt(true);
          return;
        }

        let serverAuthState;
        if (shouldVerify) {
          serverAuthState = await para.ctx.client.verifyTelegram({
            authObject: data,
            sessionLookupId: searchParams.get('sessionId') || undefined,
          });

          const loginCallbackRoute = searchParams.get('loginCallbackRoute');

          // If we have a loginCallbackRoute we always want to call onLogin to handle the redirect
          if (shouldVerify && (loginCallbackRoute || serverAuthState.stage === 'done')) {
            await onLogin();
          }
        }

        window?.parent?.postMessage(
          { type: 'TELEGRAM_SUCCESS', payload: shouldVerify ? serverAuthState : data },
          trustedOrigin,
        );
      });
    };

    document.head.appendChild(script);
  };

  useEffect(() => {
    document.body.style.backgroundColor = 'transparent';
    document.getElementById('root').style.backgroundColor = 'transparent';

    const onMessage = async (message: MessageEvent<Event>) => {
      if (trustedOrigin !== '*' && message.origin !== trustedOrigin) {
        return; // Ignore messages from untrusted origins
      }

      if (message.data.type === 'TELEGRAM_FAILED' || message.data.type === 'TELEGRAM_RETRY') {
        setIsWaiting(false);
        setIsSecondAttempt(true);
      }
    };

    window?.addEventListener('message', onMessage, false);

    return () => {
      window?.removeEventListener('message', onMessage, false);
    };
  }, []);

  const Content = (
    <>
      {shouldVerify && (
        <>
          <CpslText variant="bodyL" weight="semiBold">
            Sign in using Telegram
          </CpslText>
        </>
      )}
      {isWaiting ? (
        <>
          {shouldVerify ? (
            <SpinnerContainer>
              <CpslSpinner />
            </SpinnerContainer>
          ) : null}
        </>
      ) : isSecondAttempt ? (
        <CpslButton fullWidth onClick={onClick} variant="secondary">
          <CpslIcon slot="start" icon="refresh" />
          Try again
        </CpslButton>
      ) : (
        <CpslButton fullWidth disabled={isWaiting} onClick={onClick}>
          Login with Telegram
        </CpslButton>
      )}
    </>
  );

  if (shouldVerify) {
    return <LoginContainer $isEmbedded={isIFramed}>{Content}</LoginContainer>;
  }

  return <Container>{Content}</Container>;
}

const LoginContainer = styled.form<{ $isEmbedded?: boolean }>`
  flex: 1;
  padding-left: ${({ $isEmbedded }) => ($isEmbedded ? '0px' : '83px')};
  padding-right: ${({ $isEmbedded }) => ($isEmbedded ? '0px' : '83px')};
  padding-top: ${({ $isEmbedded }) => ($isEmbedded ? '0px' : '24px')};
  box-sizing: border-box;
  width: 100%;
  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: ${({ $isEmbedded }) => ($isEmbedded ? '24px' : '24px')};
`;

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
