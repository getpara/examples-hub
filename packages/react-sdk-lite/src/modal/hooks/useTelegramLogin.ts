import { useEffect, useState } from 'react';
import { useInternalClient } from '../../provider/hooks/utils/useInternalClient.js';
import { TelegramAuthResponse } from '@getpara/user-management-client';
import { MutationStatus } from '@tanstack/react-query';
import { useModalStore } from '../stores/index.js';

type EventType = 'TELEGRAM_LOGIN' | 'TELEGRAM_SUCCESS' | 'TELEGRAM_FAILED';

type Event = {
  type: EventType;
  payload: TelegramAuthResponse;
};

export const useTelegramLogin = ({
  isActive = false,
  onSubmit,
  status: propsStatus,
}: {
  isActive?: boolean;
  onSubmit?: (_: TelegramAuthResponse) => void;
  status?: MutationStatus;
} = {}) => {
  const para = useInternalClient();
  const refs = useModalStore(state => state.refs);

  const [url, setUrl] = useState<string>();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [msgStatus, setMsgStatus] = useState<MutationStatus>('idle');

  const status = msgStatus === 'success' ? propsStatus : msgStatus;

  useEffect(() => {
    if (isActive) {
      if (!url) {
        para.constructPortalUrl('telegramLogin').then(setUrl);
      }
    }
  }, [isActive, url]);

  useEffect(() => {
    const updateState = async (event: MessageEvent<Event>) => {
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
