import { safeStyled } from '@getpara/react-common';
import { HeroSpinner } from '@getpara/react-common';
import { CpslSpinner } from '@getpara/react-components';
import { useTelegramLogin } from '../../hooks/useTelegramLogin.js';
import React from 'react';
import { useAuthActions } from '../../../provider/providers/AuthProvider.js';
import { AccountTypeIcon } from '../common.js';
import { useModalStore } from '../../stores/index.js';

export function TelegramOAuthStep() {
  const { verifyTelegramStatus, verifyTelegram } = useAuthActions();
  const { url, status, isLoaded, setIsLoaded } = useTelegramLogin({
    isActive: true,
    status: verifyTelegramStatus,
    onSubmit: verifyTelegram,
  });

  const isError = status === 'error',
    isPending = status === 'pending';
  return (
    <Container>
      <HeroContainer>
        <HeroSpinner
          icon={<AccountTypeIcon accountType="TELEGRAM" size="48px" />}
          status={isPending ? 'pending' : isError ? 'error' : 'idle'}
          text={isPending ? 'Follow the on-screen prompts.' : isError ? 'Login Failed' : undefined}
        />
      </HeroContainer>

      <TelegramIFrame url={url} isLoaded={isLoaded} setIsLoaded={setIsLoaded} isVisible={isLoaded} />
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

const HeroContainer = safeStyled.div`
  display: flex;
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
