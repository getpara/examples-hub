import { CpslButton, CpslDivider, CpslIcon } from '@getpara/react-components';
import { useModalStore } from '../../stores/index.js';
import { Heading, StepContainer, InnerStepContainer } from '../common.js';
import styled from 'styled-components';
import { AuthMethod } from '@getpara/web-sdk';
import { KnownDevices, UserIdentifier } from '@getpara/react-common';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import { useAuthActions } from '../../../provider/providers/AuthProvider.js';

export const BiometricLoginStep = () => {
  const loginState = useModalStore(state => state.getLoginState());
  const para = useInternalClient();
  const { biometricHints, presentLoginUi } = useAuthActions();
  const isPasskeySupported = useModalStore(state => state.isPasskeySupported);

  const [isPasskey, isPassword, hasHints, isPasskeyOnKnownDevice] = [
    !!loginState?.passkeyUrl,
    !!loginState?.passwordUrl,
    loginState?.biometricHints?.length,
    isPasskeySupported && !!biometricHints?.isOnKnownDevice,
  ];

  const knownDeviceLink = loginState?.passkeyKnownDeviceUrl;
  const isPasskeyUnavailable = (hasHints && !biometricHints?.isOnKnownDevice) || !isPasskeySupported;
  const displayWelcomeBack = hasHints || isPasskeyOnKnownDevice || isPassword;

  if (!loginState) {
    return null;
  }

  return (
    <StepContainer $wide>
      <InnerStepContainer>
        {displayWelcomeBack && (
          <Heading variant="headingS" weight="bold">
            Welcome back,
          </Heading>
        )}
        <UserIdentifier authInfo={para.authInfo} />
      </InnerStepContainer>
      <MainContainer>
        {isPassword && (
          <CpslButton fullWidth onClick={() => presentLoginUi(AuthMethod.PASSWORD, loginState)}>
            Login
          </CpslButton>
        )}

        {isPasskey && !!knownDeviceLink && (
          <>
            {isPasskeyUnavailable && !!biometricHints && <KnownDevices hints={biometricHints} link={knownDeviceLink} />}
            {isPasskeySupported && (
              <>
                {isPasskeyUnavailable && <CpslDivider>or</CpslDivider>}
                <CpslButton fullWidth onClick={() => presentLoginUi(AuthMethod.PASSKEY, loginState)}>
                  {isPasskeyUnavailable ? (
                    'Continue anyway'
                  ) : (
                    <>
                      <CpslIcon slot="start" icon="key" />
                      Login with passkey
                    </>
                  )}
                </CpslButton>
              </>
            )}
          </>
        )}
      </MainContainer>
    </StepContainer>
  );
};

const MainContainer = styled(InnerStepContainer)`
  gap: 16px;
`;
