import { CpslButton, CpslDivider, CpslIcon } from '@getpara/react-components';
import { useModalStore } from '../../stores/index.js';
import { Heading, StepContainer, InnerStepContainer } from '../common.js';
import { safeStyled } from '@getpara/react-common';
import { AuthMethod } from '@getpara/web-sdk';
import { KnownDevices, UserIdentifier } from '@getpara/react-common';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import { useAuthActions } from '../../../provider/providers/AuthProvider.js';

export const BiometricLoginStep = () => {
  const loginState = useModalStore(state => state.getLoginState());
  const para = useInternalClient();
  const { biometricHints, presentLoginUi } = useAuthActions();

  if (!loginState) {
    return null;
  }

  const { passkeyUrl, passkeyKnownDeviceUrl, passwordUrl, isPasskeySupported } = loginState;
  const { isOnKnownDevice = false, formattedHints } = biometricHints || {};

  const isPasskey = !!passkeyUrl,
    isPassword = !!passwordUrl,
    isNeither = !isPasskey && !isPassword,
    hasHints = formattedHints?.length ?? 0 > 0,
    isPasskeyOnKnownDevice = isPasskeySupported && isOnKnownDevice,
    isPasskeyUnavailable = (hasHints && !isOnKnownDevice) || !isPasskeySupported || isNeither,
    displayKnownDevices = isPasskeyUnavailable && !!biometricHints && (hasHints || !!passkeyKnownDeviceUrl),
    displayWelcomeBack = isPasskeyOnKnownDevice || isPassword;

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
        {isPasskey && (
          <>
            {displayKnownDevices && (
              <>
                <KnownDevices hints={biometricHints} link={passkeyKnownDeviceUrl} />
                <CpslDivider>or</CpslDivider>
              </>
            )}
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
      </MainContainer>
    </StepContainer>
  );
};

const MainContainer = safeStyled(InnerStepContainer)`
  gap: 16px;
`;
