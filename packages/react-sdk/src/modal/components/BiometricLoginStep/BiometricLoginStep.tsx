import { CpslButton, CpslDivider, CpslIcon } from '@usecapsule/react-components';
import { useEffect, useMemo } from 'react';
import { useCapsuleStore, useModalStore, useUserInfoStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { Heading, StepContainer, InnerStepContainer } from '../common.js';
import { openPopup } from '../../utils/openPopup.js';
import styled from 'styled-components';
import { AuthMethod, getPublicKeyHex } from '@usecapsule/web-sdk';
import { isPasskeySupported } from '../../utils/isPasskeySupported.js';
import { formatBiometricHints, KnownDevices, UserIdentifier } from '@usecapsule/react-common';

export const BiometricLoginStep = () => {
  const popupWindow = useModalStore(state => state.popupWindow);
  const supportedAuthMethods = useModalStore(state => state.supportedAuthMethods);
  const passwordUrlForLogin = useModalStore(state => state.passwordUrlForLogin);
  const webAuthURLForLogin = useModalStore(state => state.webAuthURLForLogin);
  const setStep = useModalStore(state => state.setStep);
  const setPopupWindow = useModalStore(state => state.setPopupWindow);
  const biometricLocationHints = useModalStore(state => state.biometricLocationHints);
  const capsule = useCapsuleStore(state => state.capsule);
  const username = useUserInfoStore(state => state.getUsername());
  const setWebAuthURLForLogin = useModalStore(state => state.setWebAuthURLForLogin);
  const setPasswordUrlForLogin = useModalStore(state => state.setPasswordUrlForLogin);
  const passkeysSupported = isPasskeySupported();
  const formattedHints = useMemo(() => formatBiometricHints(biometricLocationHints), [biometricLocationHints]);
  const setSupportedAuthMethods = useModalStore(state => state.setSupportedAuthMethods);

  useEffect(() => {
    async function setLinks() {
      if (!supportedAuthMethods?.size && capsule.getUserId()) {
        const fetchedSupportedAuthMethods = await capsule.supportedAuthMethods(capsule.getUserId(), 'userId');
        if (fetchedSupportedAuthMethods?.size) {
          setSupportedAuthMethods(fetchedSupportedAuthMethods);
        }
        return;
      }

      if (!capsule.isEmail && !capsule.isPhone && !capsule.isFarcaster) {
        return;
      }

      const authType = capsule.isEmail ? 'email' : capsule.isPhone ? 'phone' : 'farcaster';

      const res = await capsule.touchSession();
      const webAuthUrlForLogin =
        supportedAuthMethods?.has && supportedAuthMethods.has(AuthMethod.PASSKEY)
          ? await capsule.getWebAuthURLForLogin(
              res.data.sessionId,
              getPublicKeyHex(capsule.loginEncryptionKeyPair),
              res.data.partnerId,
              undefined,
              undefined,
              authType,
            )
          : undefined;

      const passwordAuthUrlForLogin =
        supportedAuthMethods?.has && supportedAuthMethods.has(AuthMethod.PASSWORD)
          ? await capsule.getPasswordURLForLogin(
              res.data.sessionId,
              getPublicKeyHex(capsule.loginEncryptionKeyPair),
              res.data.partnerId,
              undefined,
              undefined,
              authType,
            )
          : undefined;

      const shortWebAuthLoginLink = webAuthUrlForLogin ? await capsule.shortenLoginLink(webAuthUrlForLogin) : undefined;

      setWebAuthURLForLogin(shortWebAuthLoginLink);
      setPasswordUrlForLogin(passwordAuthUrlForLogin);
    }

    setLinks();
  }, [supportedAuthMethods]);

  const handlePasskeyClick = () => {
    if (!!popupWindow) {
      return;
    }

    const loginWindow = openPopup(webAuthURLForLogin, 'CapsulePasskey', 'LOGIN_PASSKEY');

    setPopupWindow(loginWindow);
    setStep(ModalStep.AWAITING_BIOMETRIC_LOGIN);
  };

  const handlePasswordClick = () => {
    const loginWindow = openPopup(passwordUrlForLogin, 'CapsulePassword', 'LOGIN_PASSWORD');
    setPopupWindow(loginWindow);
    setStep(ModalStep.AWAITING_PASSWORD_LOGIN);
  };

  function shouldShowWelcomeBack() {
    return (
      !biometricLocationHints ||
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
        <UserIdentifier identifier={username} />
      </InnerStepContainer>
      <MainContainer>
        {supportedAuthMethods?.has && supportedAuthMethods.has(AuthMethod.PASSWORD) && passwordUrlForLogin && (
          <PasswordOnly handlePasswordClick={handlePasswordClick} />
        )}

        {supportedAuthMethods?.has && supportedAuthMethods.has(AuthMethod.PASSKEY) && webAuthURLForLogin && (
          <BiometricOnly
            handlePasskeyClick={handlePasskeyClick}
            formattedHints={formattedHints}
            shortLoginLink={webAuthURLForLogin}
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
  biometricLocationHints,
}) => {
  return (
    <>
      {((biometricLocationHints?.length && !formattedHints.isOnKnownDevice) || !passkeysSupported) && (
        <KnownDevices hints={formattedHints} link={shortLoginLink} />
      )}
      {passkeysSupported && (
        <>
          {biometricLocationHints?.length && !formattedHints.isOnKnownDevice && <CpslDivider>or</CpslDivider>}
          <CpslButton fullWidth onClick={handlePasskeyClick}>
            {!biometricLocationHints?.length || formattedHints.isOnKnownDevice ? (
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
