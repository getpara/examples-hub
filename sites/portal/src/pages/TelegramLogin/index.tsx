import { useEffect, useState } from 'react';
import { useCapsule } from '../../components/CapsuleContext';
import { CpslButton, CpslIcon } from '@usecapsule/react-components';
import styled from 'styled-components';
import { TelegramAuthResponse } from '@usecapsule/user-management-client';
import { Environment } from '@usecapsule/web-sdk';

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

export function TelegramLogin() {
  const capsule = useCapsule();
  const [isWaiting, setIsWaiting] = useState(false);
  const [isSecondAttempt, setIsSecondAttempt] = useState(false);

  const botId = (() => {
    switch (capsule.ctx.env) {
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
    window?.parent?.postMessage({ type: 'TELEGRAM_LOGIN' }, '*');

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script['data-telegram-login'] = `${botId}`;
    script.onload = () => {
      window.Telegram?.Login.auth({ bot_id: `${botId}`, request_access: true }, data => {
        if (!data) {
          window?.parent?.postMessage({ type: 'TELEGRAM_FAILED' }, '*');
          setIsWaiting(false);
          setIsSecondAttempt(true);
          return;
        }

        window?.parent?.postMessage({ type: 'TELEGRAM_SUCCESS', payload: data }, '*');
      });
    };

    document.head.appendChild(script);
  };

  useEffect(() => {
    const onMessage = async (message: MessageEvent<Event>) => {
      if (message.data.type === 'TELEGRAM_FAILED') {
        setIsWaiting(false);
        setIsSecondAttempt(true);
      }
    };

    window?.addEventListener('message', onMessage, false);

    return () => {
      window?.removeEventListener('message', onMessage, false);
    };
  }, []);

  return (
    <Container>
      {isWaiting ? null : isSecondAttempt ? (
        <CpslButton onClick={onClick} variant="secondary">
          <CpslIcon slot="start" icon="refresh" />
          Try again
        </CpslButton>
      ) : (
        <CpslButton fullWidth disabled={isWaiting} onClick={onClick}>
          Login with Telegram
        </CpslButton>
      )}
    </Container>
  );
}

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
