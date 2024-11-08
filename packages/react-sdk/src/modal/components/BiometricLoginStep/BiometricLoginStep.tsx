import { CpslButton, CpslDivider, CpslIcon } from '@usecapsule/react-components';
import { useEffect, useMemo, useState } from 'react';
import { useCapsuleStore, useModalStore, useUserInfoStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { Heading, StepContainer, InnerStepContainer } from '../common.js';
import { openPopup } from '../../utils/openPopup.js';
import styled from 'styled-components';
import { AuthMethod, getPublicKeyHex } from '@usecapsule/web-sdk';
import { isPasskeySupported } from '../../utils/isPasskeySupported.js';
import { formatBiometricHints, KnownDevices, UserIdentifier } from '@usecapsule/react-common';

export const BiometricLoginStep = () => {
  const supportedAuthMethods = useModalStore(state => state.supportedAuthMethods);
  const setStep = useModalStore(state => state.setStep);
  const setLoginWindow = useModalStore(state => state.setLoginWindow);
  const biometricLocationHints = useModalStore(state => state.biometricLocationHints);
  const capsule = useCapsuleStore(state => state.capsule);
  const username = useUserInfoStore(state => state.getUsername());
  const [webAuthURLForLogin, setWebAuthURLForLogin] = useState<string>();
  const [passwordAuthUrlForLogin, setPasswordAuthUrlForLogin] = useState<string>();
  const passkeysSupported = isPasskeySupported();
  const formattedHints = useMemo(() => formatBiometricHints(biometricLocationHints), [biometricLocationHints]);

  useEffect(() => {
    async function setLinks() {
      const res = await capsule.touchSession();
      const webAuthUrlForLogin = supportedAuthMethods.has(AuthMethod.PASSKEY)
        ? await capsule.getWebAuthURLForLogin(
            res.data.sessionId,
            getPublicKeyHex(capsule.loginEncryptionKeyPair),
            res.data.partnerId,
            undefined,
            undefined,
            'email',
          )
        : undefined;

      const passwordAuthUrlForLogin = supportedAuthMethods.has(AuthMethod.PASSWORD)
        ? await capsule.getPasswordURLForLogin(
            res.data.sessionId,
            getPublicKeyHex(capsule.loginEncryptionKeyPair),
            res.data.partnerId,
            undefined,
            undefined,
            'email',
          )
        : undefined;

      const shortWebAuthLoginLink = webAuthUrlForLogin ? await capsule.shortenLoginLink(webAuthUrlForLogin) : undefined;

      setWebAuthURLForLogin(shortWebAuthLoginLink);
      setPasswordAuthUrlForLogin(passwordAuthUrlForLogin);
    }

    setLinks();
  }, [supportedAuthMethods]);

  const handlePasskeyClick = () => {
    const loginWindow = openPopup(webAuthURLForLogin, 'CapsulePasskey', 'LOGIN_PASSKEY');

    setLoginWindow(loginWindow);
    setStep(ModalStep.AWAITING_BIOMETRIC_LOGIN);
  };

  const handlePasswordClick = () => {
    const loginWindow = openPopup(passwordAuthUrlForLogin, 'CapsulePassword', 'LOGIN_PASSWORD');
    setLoginWindow(loginWindow);
    setStep(ModalStep.AWAITING_PASSWORD_LOGIN);
  };

  function shouldShowWelcomeBack() {
    return (
      !biometricLocationHints ||
      (passkeysSupported && formattedHints.isOnKnownDevice) ||
      supportedAuthMethods.has(AuthMethod.PASSWORD)
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
        {supportedAuthMethods.has(AuthMethod.PASSWORD) && passwordAuthUrlForLogin && (
          <PasswordOnly handlePasswordClick={handlePasswordClick} />
        )}

        {supportedAuthMethods.has(AuthMethod.PASSKEY) && webAuthURLForLogin && (
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
