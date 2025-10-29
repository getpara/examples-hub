import { safeStyled } from '@getpara/react-common';
import { CpslSpinner } from '@getpara/react-components';
import { useTelegramLogin } from '../../hooks/useTelegramLogin.js';
import React, { useEffect, useState } from 'react';
import { useAuthActions } from '../../../provider/providers/AuthProvider.js';
import { useModalStore } from '../../stores/index.js';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import { validatePortalOrigin } from '../../utils/validatePortalOrigin.js';

export function TelegramOAuthStep() {
  const { verifyTelegramStatus, verifyTelegram } = useAuthActions();
  const { url, isLoaded, setIsLoaded } = useTelegramLogin({
    isActive: true,
    status: verifyTelegramStatus,
    onSubmit: verifyTelegram,
    isLinking: false,
  });
  const refs = useModalStore(state => state.refs);
  const para = useInternalClient();
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!url) {
        return; // No iFrame URL to check against
      }

      if (!validatePortalOrigin(event, para.ctx)) {
        return; // Ignore messages from untrusted origins
      }

      if (event.data) {
        if (event.data.type === 'HEIGHT') {
          setHeight(event.data.height);
        }
      }
    };
    typeof window !== 'undefined' && window.addEventListener('message', handleMessage);
    return () => {
      typeof window !== 'undefined' && window.removeEventListener('message', handleMessage);
    };
  }, [url]);

  return (
    <Container>
      {url && (
        <IFrame
          ref={refs.telegramIFrame}
          style={{ display: isLoaded ? 'block' : 'none', height }}
          src={url}
          onLoad={() => setIsLoaded(true)}
        />
      )}
      {(!url || !isLoaded) && <CpslSpinner />}
    </Container>
  );
}

export function TelegramIFrame({
  url,
  isLoaded,
  setIsLoaded,
  isVisible = false,
}: {
  url?: string;
  isLoaded: boolean;
  setIsLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  isVisible?: boolean;
}) {
  const refs = useModalStore(state => state.refs);

  if (!url) return null;

  return (
    <Container>
      {url && (
        <IFrame
          ref={refs.telegramIFrame}
          style={{ display: isLoaded && isVisible ? 'block' : 'none' }}
          src={url}
          onLoad={() => setIsLoaded(true)}
        />
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

const IFrame = safeStyled.iframe`
  width: 100%;
  height: 52px;
  border: none;
`;
