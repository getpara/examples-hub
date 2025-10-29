import { useEffect, useState } from 'react';
import { useInternalClient } from '../../provider/hooks/utils/useInternalClient.js';
import { VerifyThirdPartyAuth } from '@getpara/user-management-client';
import { MutationStatus } from '@tanstack/react-query';
import { useModalStore } from '../stores/index.js';
import { useAuthActions } from '../../provider/providers/AuthProvider.js';
import { validatePortalOrigin } from '../utils/validatePortalOrigin.js';

type EventType = 'FARCASTER_LOGIN' | 'FARCASTER_SUCCESS' | 'FARCASTER_FAILED';

type Event = {
  type: EventType;
  payload: VerifyThirdPartyAuth;
};

export const useFarcasterLogin = ({
  isActive = false,
}: {
  isActive?: boolean;
} = {}) => {
  const para = useInternalClient();
  const refs = useModalStore(state => state.refs);
  const { verifyFarcasterStatus, verifyFarcaster } = useAuthActions();

  const [url, setUrl] = useState<string>();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [msgStatus, setMsgStatus] = useState<MutationStatus>('idle');

  const status = msgStatus === 'success' ? verifyFarcasterStatus : msgStatus;

  useEffect(() => {
    const setup = async () => {
      if (!url) {
        await para.logout();
        await para.touchSession(true);
        para.constructPortalUrl('loginFarcaster').then(setUrl);
      }
    };

    if (isActive) {
      setup();
    }
  }, [isActive, url]);

  useEffect(() => {
    if (typeof window === 'undefined') return; // Prevent SSR errors

    const updateState = async (event: MessageEvent<Event>) => {
      if (!validatePortalOrigin(event, para.ctx)) {
        return; // Ignore messages from untrusted origins
      }

      switch (event.data.type) {
        case 'FARCASTER_LOGIN':
          setMsgStatus('pending');
          break;
        case 'FARCASTER_FAILED':
          setMsgStatus('error');
          break;
        case 'FARCASTER_SUCCESS':
          setMsgStatus('success');
          if (!!event.data.payload) {
            const authObject = event.data.payload;

            try {
              await verifyFarcaster(authObject);
            } catch (e) {
              refs.telegramIFrame.current?.contentWindow?.postMessage({ type: 'FARCASTER_RETRY' }, '*');
            }
          }
          break;
      }
    };

    if (isActive) {
      window?.addEventListener('message', updateState, false);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('message', updateState, false);
      }
    };
  }, [isActive]);

  return {
    url,
    isLoaded,
    setIsLoaded,
    status,
  };
};
