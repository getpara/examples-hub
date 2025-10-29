import { useEffect, useState } from 'react';
import { useInternalClient } from '../../provider/hooks/utils/useInternalClient.js';
import { TelegramAuthResponse, VerifyThirdPartyAuth } from '@getpara/user-management-client';
import { MutationStatus } from '@tanstack/react-query';
import { useModalStore } from '../stores/index.js';
import { validatePortalOrigin } from '../utils/validatePortalOrigin.js';

type EventType = 'TELEGRAM_LOGIN' | 'TELEGRAM_SUCCESS' | 'TELEGRAM_FAILED';

type Event = {
  type: EventType;
  payload: VerifyThirdPartyAuth | TelegramAuthResponse;
};

export const useTelegramLogin = ({
  isActive = false,
  onSubmit,
  status: propsStatus,
  isLinking,
}: {
  isActive?: boolean;
  onSubmit?: (_: VerifyThirdPartyAuth | TelegramAuthResponse) => void;
  status?: MutationStatus;
  isLinking?: boolean;
} = {}) => {
  const para = useInternalClient();
  const refs = useModalStore(state => state.refs);

  const [url, setUrl] = useState<string>();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [msgStatus, setMsgStatus] = useState<MutationStatus>('idle');

  const status = msgStatus === 'success' ? propsStatus : msgStatus;

  useEffect(() => {
    const setup = async () => {
      if (!url) {
        if (!isLinking) {
          await para.logout();
          await para.touchSession(true);
        }

        para.constructPortalUrl(!isLinking ? 'telegramLoginVerify' : 'telegramLogin').then(setUrl);
      }
    };

    if (isActive) {
      setup();
    }
  }, [isActive, url]);

  useEffect(() => {
    const updateState = async (event: MessageEvent<Event>) => {
      if (!validatePortalOrigin(event, para.ctx)) {
        return; // Ignore messages from untrusted origins
      }

      switch (event.data.type) {
        case 'TELEGRAM_LOGIN':
          setMsgStatus('pending');
          break;
        case 'TELEGRAM_FAILED':
          setMsgStatus('error');
          break;
        case 'TELEGRAM_SUCCESS':
          setMsgStatus('success');
          if (!!event.data.payload) {
            const authObject = event.data.payload;

            try {
              await onSubmit?.(authObject);
            } catch (e) {
              refs.telegramIFrame.current?.contentWindow?.postMessage({ type: 'TELEGRAM_RETRY' }, '*');
            }
          }
          break;
      }
    };

    if (isActive) {
      window?.addEventListener('message', updateState, false);
    }

    return () => {
      window?.removeEventListener('message', updateState, false);
    };
  }, [isActive, onSubmit]);

  return {
    url,
    isLoaded,
    setIsLoaded,
    status,
  };
};
