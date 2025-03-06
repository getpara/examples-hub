import { CpslButton, CpslDivider, CpslIcon } from '@getpara/react-components';
import { useEffect, useMemo, useState } from 'react';
import { useModalStore, useUserInfoStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { Heading, StepContainer, InnerStepContainer } from '../common.js';
import { openPopup } from '../../utils/openPopup.js';
import styled from 'styled-components';
import { AuthMethod, getPublicKeyHex, isPasskeySupported } from '@getpara/web-sdk';
import { BiometricHints, formatBiometricHints, KnownDevices, UserIdentifier } from '@getpara/react-common';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import { BiometricLocationHint } from '@getpara/user-management-client';

export const BiometricLoginStep = () => {
  const refs = useModalStore(state => state.refs);
  const supportedAuthMethods = useModalStore(state => state.supportedAuthMethods);
  const passwordUrlForLogin = useModalStore(state => state.passwordUrlForLogin);
  const webAuthURLForLogin = useModalStore(state => state.webAuthURLForLogin);
  const setStep = useModalStore(state => state.setStep);
  const biometricLocationHints = useModalStore(state => state.biometricLocationHints);
  const para = useInternalClient();
  const authInfo = useUserInfoStore(state => state.getAuthInfo());
  const setWebAuthURLForLogin = useModalStore(state => state.setWebAuthURLForLogin);
  const setPasswordUrlForLogin = useModalStore(state => state.setPasswordUrlForLogin);
  const passkeysSupported = isPasskeySupported();
  const formattedHints = useMemo(() => formatBiometricHints(biometricLocationHints ?? []), [biometricLocationHints]);
  const setSupportedAuthMethods = useModalStore(state => state.setSupportedAuthMethods);

  const [webAuthURLForKnownDeviceLogin, setWebAuthURLForKnownDeviceLogin] = useState<string>();

  useEffect(() => {
    async function setLinks() {
      if (!supportedAuthMethods?.size && para.getUserId()) {
        const fetchedSupportedAuthMethods = await para.supportedAuthMethods({ userId: para.getUserId()! });
        if (fetchedSupportedAuthMethods?.size) {
          setSupportedAuthMethods(fetchedSupportedAuthMethods);
        }
        return;
      }

      if (!para.isEmail && !para.isPhone && !para.isFarcaster && !para.isTelegram) {
        return;
      }

      if (!para.loginEncryptionKeyPair) {
        return;
      }

      const authType = para.isEmail ? 'email' : para.isPhone ? 'phone' : para.isFarcaster ? 'farcaster' : 'telegram';

      const res = await para.touchSession();
      const webAuthUrlForLogin =
        supportedAuthMethods?.has && supportedAuthMethods.has(AuthMethod.PASSKEY)
          ? await para.getWebAuthURLForLogin({
              sessionId: res.data.sessionId,
              loginEncryptionPublicKey: getPublicKeyHex(para.loginEncryptionKeyPair),
              partnerId: res.data.partnerId,
              authType,
              displayName: authInfo?.displayName ?? '',
              pfpUrl: authInfo?.pfpUrl ?? '',
            })
          : undefined;

      const _webAuthURLForKnownDeviceLogin =
        supportedAuthMethods?.has && supportedAuthMethods.has(AuthMethod.PASSKEY)
          ? await para.getWebAuthURLForLogin({
              sessionId: res.data.sessionId,
              loginEncryptionPublicKey: getPublicKeyHex(para.loginEncryptionKeyPair),
              partnerId: res.data.partnerId,
              newDeviceSessionId: res.data.sessionLookupId,
              newDeviceEncryptionKey: getPublicKeyHex(para.loginEncryptionKeyPair),
              authType,
              displayName: authInfo?.displayName ?? '',
              pfpUrl: authInfo?.pfpUrl ?? '',
            })
          : undefined;

      const passwordAuthUrlForLogin =
        supportedAuthMethods?.has && supportedAuthMethods.has(AuthMethod.PASSWORD)
          ? await para.getPasswordURLForLogin({
              sessionId: res.data.sessionId,
              loginEncryptionPublicKey: getPublicKeyHex(para.loginEncryptionKeyPair),
              partnerId: res.data.partnerId,
              authType,
              displayName: authInfo?.displayName ?? '',
              pfpUrl: authInfo?.pfpUrl ?? '',
            })
          : undefined;

      const shortWebAuthLoginLink = webAuthUrlForLogin ? await para.shortenLoginLink(webAuthUrlForLogin) : undefined;
      const shortWebAuthForKnownDeviceLoginLink = _webAuthURLForKnownDeviceLogin
        ? await para.shortenLoginLink(_webAuthURLForKnownDeviceLogin)
        : undefined;

      setWebAuthURLForKnownDeviceLogin(shortWebAuthForKnownDeviceLoginLink);
      setWebAuthURLForLogin(shortWebAuthLoginLink);
      setPasswordUrlForLogin(passwordAuthUrlForLogin);
    }

    setLinks();
  }, [supportedAuthMethods, para]);

  const handlePasskeyClick = () => {
    if (!!webAuthURLForLogin) {
      refs.popupWindow.current =
        openPopup({
          url: webAuthURLForLogin,
          target: 'ParaPasskey',
          type: 'LOGIN_PASSKEY',
          current: refs.popupWindow.current,
        }) ?? null;

      setStep(ModalStep.AWAITING_BIOMETRIC_LOGIN);
    }
  };

  const handlePasswordClick = () => {
    if (!!passwordUrlForLogin) {
      refs.popupWindow.current = openPopup({
        url: passwordUrlForLogin,
        target: 'ParaPassword',
        type: 'LOGIN_PASSWORD',
        current: refs.popupWindow.current,
      });

      setStep(ModalStep.AWAITING_PASSWORD_LOGIN);
    }
  };

  function shouldShowWelcomeBack() {
    return (
      !biometricLocationHints?.length ||
      (passkeysSupported && formattedHints.isOnKnownDevice) ||
      (supportedAuthMethods?.has && supportedAuthMethods.has(AuthMethod.PASSWORD))
    );
  }

  return (
    <StepContainer $wide>
      <InnerStepContainer>
        {shouldShowWelcomeBack() && (
          <Heading variant="headingS" weight="bold">
            Welcome back,
          </Heading>
        )}
        {authInfo && <UserIdentifier {...authInfo} />}
      </InnerStepContainer>
      <MainContainer>
        {supportedAuthMethods?.has && supportedAuthMethods.has(AuthMethod.PASSWORD) && passwordUrlForLogin && (
          <PasswordOnly handlePasswordClick={handlePasswordClick} />
        )}

        {supportedAuthMethods?.has &&
          supportedAuthMethods.has(AuthMethod.PASSKEY) &&
          webAuthURLForLogin &&
          webAuthURLForKnownDeviceLogin && (
            <BiometricOnly
              handlePasskeyClick={handlePasskeyClick}
              formattedHints={formattedHints}
              shortLoginLink={webAuthURLForKnownDeviceLogin}
              passkeysSupported={passkeysSupported}
              biometricLocationHints={biometricLocationHints}
            />
          )}
      </MainContainer>
    </StepContainer>
  );
};

const PasswordOnly = ({ handlePasswordClick }) => {
  return (
    <CpslButton fullWidth onClick={handlePasswordClick}>
      Login
    </CpslButton>
  );
};

const BiometricOnly = ({
  handlePasskeyClick,
  formattedHints,
  shortLoginLink,
  passkeysSupported,
  biometricLocationHints = [],
}: {
  handlePasskeyClick: () => void;
  formattedHints: BiometricHints;
  shortLoginLink: string;
  passkeysSupported: boolean;
  biometricLocationHints?: BiometricLocationHint[];
}) => {
  const [hasHints, isOnKnownDevice] = [biometricLocationHints.length > 0, formattedHints.isOnKnownDevice];
  return (
    <>
      {((hasHints && !isOnKnownDevice) || !passkeysSupported) && (
        <KnownDevices hints={formattedHints} link={shortLoginLink} />
      )}
      {passkeysSupported && (
        <>
          {hasHints && !isOnKnownDevice && <CpslDivider>or</CpslDivider>}
          <CpslButton fullWidth onClick={handlePasskeyClick}>
            {!hasHints || isOnKnownDevice ? (
              <>
                <CpslIcon slot="start" icon="key" />
                Login with passkey
              </>
            ) : (
              'Continue anyway'
            )}
          </CpslButton>
        </>
      )}
    </>
  );
};

const MainContainer = styled(InnerStepContainer)`
  gap: 16px;
`;
