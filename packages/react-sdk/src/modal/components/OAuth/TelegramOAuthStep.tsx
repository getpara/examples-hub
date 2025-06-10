import { constructUrl, getPortalBaseURL } from '@getpara/web-sdk';
import { safeStyled } from '@getpara/react-common';
import { useEffect, useRef, useState } from 'react';
import { HeroSpinner } from '@getpara/react-common';
import { TelegramAuthResponse } from '@getpara/user-management-client';
import { CpslSpinner } from '@getpara/react-components';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import { useAuthActions } from '../../../provider/providers/AuthProvider.js';

type EventType = 'TELEGRAM_LOGIN' | 'TELEGRAM_SUCCESS' | 'TELEGRAM_FAILED';

type Event = {
  type: EventType;
  payload: TelegramAuthResponse;
};

export function TelegramOAuthStep() {
  const iframe = useRef<any>();
  const para = useInternalClient();
  const { verifyTelegram } = useAuthActions();

  const [url, setUrl] = useState<string>();
  const [isWaiting, setIsWaiting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!url) {
      setUrl(
        constructUrl({
          base: getPortalBaseURL(para.ctx, true),
          path: '/auth/telegram',
        }),
      );
    }
  }, [url]);

  useEffect(() => {
    const updateState = async (event: MessageEvent<Event>) => {
      switch (event.data.type) {
        case 'TELEGRAM_LOGIN':
          setIsWaiting(true);
          setIsError(false);
          break;
        case 'TELEGRAM_FAILED':
          setIsWaiting(false);
          setIsError(true);
          break;
        case 'TELEGRAM_SUCCESS':
          if (!!event.data.payload) {
            const authObject = event.data.payload;

            verifyTelegram(authObject);
          }
          break;
      }
    };

    window?.addEventListener('message', updateState, false);

    return () => {
      window?.removeEventListener('message', updateState, false);
    };
  }, []);

  return (
    <Container>
      <HeroContainer>
        <HeroSpinner
          icon="telegramBrand"
          status={isWaiting ? 'loading' : isError ? 'error' : 'inactive'}
          text={isWaiting ? 'Follow the on-screen prompts.' : isError ? 'Login Failed' : undefined}
        />
      </HeroContainer>

      {url && (
        <IFrame ref={iframe} style={{ display: isLoaded ? 'block' : 'none' }} src={url} onLoad={() => setIsLoaded(true)} />
      )}
      {(!url || !isLoaded) && <CpslSpinner />}
    </Container>
  );
}

const Container = safeStyled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const HeroContainer = safeStyled.div`
  display: flex;
  min-height: 276px;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  flex: 1;
`;

const IFrame = safeStyled.iframe`
  width: 100%;
  height: 52px;
  border: none;
`;
