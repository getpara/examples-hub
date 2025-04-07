import { AuthMethod, OAuthMethod } from '@getpara/web-sdk';
import { useModalStore } from '../../stores/index.js';
import styled from 'styled-components';
import { useEffect, useRef, useState } from 'react';
import { HeroSpinner } from '@getpara/react-common';
import { ModalStep } from '../../utils/steps.js';
import { TelegramAuthResponse } from '@getpara/user-management-client';
import { CpslSpinner } from '@getpara/react-components';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import { useStore } from '../../../provider/stores/useStore.js';

type EventType = 'TELEGRAM_LOGIN' | 'TELEGRAM_SUCCESS' | 'TELEGRAM_FAILED';

type Event = {
  type: EventType;
  payload: TelegramAuthResponse;
};

export function TelegramOAuthStep() {
  const iframe = useRef<any>();
  const para = useInternalClient();
  const setFlow = useModalStore(state => state.setFlow);
  const setStep = useModalStore(state => state.setStep);
  const setBiometricLocationHints = useModalStore(state => state.setBiometricLocationHints);
  const setSupportedAuthMethods = useModalStore(state => state.setSupportedAuthMethods);
  const setIFrameUrl = useModalStore(state => state.setIFrameUrl);
  const setIsIFrameReady = useModalStore(state => state.setIsIFrameReady);
  const setAuthStepRoute = useModalStore(state => state.setAuthStepRoute);
  const setWebAuthURLForCreate = useModalStore(state => state.setWebAuthURLForCreate);
  const theme = useStore(state => state.modalConfig?.theme);

  const [url, setUrl] = useState<string>();
  const [isWaiting, setIsWaiting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!url) {
      para.getOAuthURL({ method: OAuthMethod.TELEGRAM }).then(url => {
        setUrl(url);
      });
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
            const result = await para.verifyTelegram(authObject);

            if (!result.isValid) {
              setIsWaiting(false);
              setIsError(true);

              iframe.current && iframe.current.contentWindow?.postMessage({ type: 'TELEGRAM_FAILED' }, '*');

              return;
            }

            const { isNewUser, supportedAuthMethods, biometricHints } = result;

            if (isNewUser) {
              const supportedCreateAuthMethods = await para.getSupportedCreateAuthMethods();

              setIsIFrameReady(false);
              setFlow('signup');
              const supportsPasskey = supportedCreateAuthMethods.has(AuthMethod.PASSKEY);

              if (supportsPasskey) {
                setWebAuthURLForCreate(
                  await para.shortenLoginLink(await para.getSetUpBiometricsURL({ authType: 'telegram' })),
                );
                setStep(ModalStep.BIOMETRIC_CREATION);
              }
              if (supportedCreateAuthMethods.has(AuthMethod.PASSWORD)) {
                setIFrameUrl(await para.shortenLoginLink(await para.getSetupPasswordURL({ authType: 'telegram', theme })));
                setAuthStepRoute(supportsPasskey ? ModalStep.BIOMETRIC_CREATION : ModalStep.PASSWORD_CREATION);
              }
            } else {
              setFlow('login');
              supportedAuthMethods && setSupportedAuthMethods(new Set<AuthMethod>(supportedAuthMethods));
              biometricHints && setBiometricLocationHints(biometricHints);
              setStep(ModalStep.BIOMETRIC_LOGIN);
            }
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

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const HeroContainer = styled.div`
  display: flex;
  min-height: 276px;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  flex: 1;
`;

const IFrame = styled.iframe`
  width: 100%;
  height: 52px;
  border: none;
`;
