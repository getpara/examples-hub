import { AuthMethod, OAuthMethod } from '@usecapsule/web-sdk';
import { useCapsuleStore, useModalStore, useUserInfoStore } from '../../stores/index.js';
import styled from 'styled-components';
import { useEffect, useRef, useState } from 'react';
import { HeroSpinner } from '@usecapsule/react-common';
import { ModalStep } from '../../utils/steps.js';
import { TelegramAuthResponse } from '@usecapsule/user-management-client';
import { CpslSpinner } from '@usecapsule/react-components';

type EventType = 'TELEGRAM_LOGIN' | 'TELEGRAM_SUCCESS' | 'TELEGRAM_FAILED';

type Event = {
  type: EventType;
  payload: TelegramAuthResponse;
};

export function TelegramOAuthStep() {
  const iframe = useRef<HTMLIFrameElement>();
  const capsule = useCapsuleStore(state => state.capsule);
  const setFlow = useModalStore(state => state.setFlow);
  const setStep = useModalStore(state => state.setStep);
  const setAuthInfo = useUserInfoStore(state => state.setAuthInfo);
  const setBiometricLocationHints = useModalStore(state => state.setBiometricLocationHints);
  const setSupportedAuthMethods = useModalStore(state => state.setSupportedAuthMethods);
  const setPasswordURLForCreate = useModalStore(state => state.setPasswordUrlForCreate);
  const setWebAuthURLForCreate = useModalStore(state => state.setWebAuthURLForCreate);

  const [url, setUrl] = useState(undefined);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!url) {
      capsule.getOAuthURL(OAuthMethod.TELEGRAM).then(url => {
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
            const result = await capsule.verifyTelegram(authObject);

            if (!result.isValid) {
              setIsWaiting(false);
              setIsError(true);

              iframe.current && iframe.current.contentWindow.postMessage({ type: 'TELEGRAM_FAILED' }, '*');

              return;
            }

            const { telegramUserId, isNewUser, supportedAuthMethods, biometricHints } = result;

            setAuthInfo({
              telegramUserId,
              pfpUrl: authObject.photo_url,
              displayName: authObject.username
                ? `@${authObject.username}`
                : authObject.first_name
                  ? `${authObject.first_name}${authObject.last_name ? ` ${authObject.last_name}` : ''}`
                  : `Telegram User @${telegramUserId}`,
            });

            if (isNewUser) {
              const supportedCreateAuthMethods = await capsule.getSupportedCreateAuthMethods();

              if (supportedCreateAuthMethods.has(AuthMethod.PASSWORD)) {
                setPasswordURLForCreate(await capsule.getSetupPasswordURL(false, 'telegram'));
              }

              if (supportedCreateAuthMethods.has(AuthMethod.PASSKEY)) {
                setWebAuthURLForCreate(await capsule.getSetUpBiometricsURL(false, 'telegram'));
              }

              const webAuthURLForCreate = await capsule.getSetUpBiometricsURL(false, 'telegram');
              setFlow('signUp');
              setWebAuthURLForCreate(webAuthURLForCreate);
              setStep(ModalStep.BIOMETRIC_CREATION);
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
