import { styled } from 'styled-components';
import { CpslButton, CpslDivider, CpslIcon, CpslText } from '@getpara/react-components';
import { useEffect, useMemo, useRef } from 'react';
import { BiometricLocationHint } from '@getpara/user-management-client';
import { FlexStartInnerContainer, usePara } from '../../../components';
import { KNOWN_DEVICE_LOGIN_POLLING_INTERVAL } from '../../../constants';
import { formatBiometricHints, getBrowserName, KnownDevices } from '@getpara/react-common';
import { isPasskeySupported } from '@getpara/web-sdk';

interface LoginFailedStepProps {
  onLoginClick: () => void;
  onLoginFromAnotherDevice: () => Promise<void>;
  biometricLocationHints: BiometricLocationHint[];
  urlForKnownDeviceLogin?: string;
}

export const LoginFailedStep = ({
  onLoginClick,
  onLoginFromAnotherDevice,
  biometricLocationHints,
  urlForKnownDeviceLogin,
}: LoginFailedStepProps) => {
  const loginTimeout = useRef<number>();

  const para = usePara();

  const sessionListener = async (): Promise<void> => {
    const touchRes = await para.touchSession();
    const isAuthenticated = touchRes.data.isAuthenticated;
    const hasSetWallets = touchRes.data.currentWalletIds !== undefined;
    const needsWallet = touchRes.data.needsWallet !== undefined;
    // Treat session as setup if authenticated and wallets are selected &/or the user needs a wallet
    const isSessionSetup = isAuthenticated && (hasSetWallets || needsWallet);
    if (!isSessionSetup) {
      loginTimeout.current = window.setTimeout(sessionListener, KNOWN_DEVICE_LOGIN_POLLING_INTERVAL);
      return;
    }

    await onLoginFromAnotherDevice();
  };

  useEffect(() => {
    loginTimeout.current = window.setTimeout(sessionListener, KNOWN_DEVICE_LOGIN_POLLING_INTERVAL);
    return () => {
      window.clearTimeout(loginTimeout.current);
    };
  }, []);

  const formattedHints = useMemo(() => formatBiometricHints(biometricLocationHints), [biometricLocationHints]);

  return (
    <FlexStartInnerContainer>
      <CpslText weight="bold" variant="headingS">
        Login Failed
      </CpslText>
      {isPasskeySupported() && (
        <>
          <TipsContainer>
            <TipListItem>
              <StyledIcon icon="lockKeyholeCircle" />
              <CpslText weight="medium" variant="bodyXS" color="contrast">
                If you use a Password Manager, please make sure it is enabled.
              </CpslText>
            </TipListItem>
            <TipListItem>
              <StyledIcon icon="userCircle" />
              <CpslText weight="medium" variant="bodyXS" color="contrast">
                {`Make sure you are using the right ${getBrowserName() ?? 'browser'} profile.`}
              </CpslText>
            </TipListItem>
          </TipsContainer>
          <CpslButton fullWidth onClick={onLoginClick}>
            Try again on this device
          </CpslButton>
          <CpslDivider>or</CpslDivider>
        </>
      )}
      <KnownDevices hints={formattedHints} link={urlForKnownDeviceLogin} showCurrentDevice />
    </FlexStartInnerContainer>
  );
};

const TipsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--cpsl-color-background-4);
  padding: 16px;
  width: 100%;
  border-radius: 16px;
`;

const TipListItem = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const StyledIcon = styled(CpslIcon)`
  --height: 20px;
  --width: 20px;
`;
