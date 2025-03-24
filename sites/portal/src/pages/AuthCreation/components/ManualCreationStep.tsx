import { styled } from 'styled-components';
import { FlexStartInnerContainer } from '../../../components/common';
import { CpslButton, CpslQrCode, CpslSpinner, CpslText } from '@getpara/react-components';
import { CenteredText } from '@getpara/react-common';
import { isPasskeySupported } from '@getpara/web-sdk';
import { usePara } from '../../../components/ParaContext';
import { useEffect, useRef, useState } from 'react';
import { KNOWN_DEVICE_LOGIN_POLLING_INTERVAL } from '../../../constants';
import { useCloseWindow } from '../../../hooks/useCloseWindow';

interface ManualCreationStepProps {
  onCreateClick: () => void;
}

export const ManualCreationStep = ({ onCreateClick }: ManualCreationStepProps) => {
  const closeWindow = useCloseWindow();
  const [webAuthURLForCreate, setWebAuthURLForCreate] = useState<string | null>(null);
  const [isPasskeySupportedValue, setIsPasskeySupportedValue] = useState<boolean>();
  const [isUIReady, setIsUIReady] = useState(false);
  const loginTimeout = useRef<number>();
  const para = usePara();

  const sessionListener = async (): Promise<void> => {
    const { isAuthenticated } = await para.touchSession();
    // Treat session as setup if authenticated and wallets are selected &/or the user needs a wallet
    if (!isAuthenticated) {
      loginTimeout.current = window.setTimeout(sessionListener, KNOWN_DEVICE_LOGIN_POLLING_INTERVAL);
      return;
    }

    closeWindow();
  };

  useEffect(() => {
    (async function () {
      const _isPasskeySupported = await isPasskeySupported();
      setIsPasskeySupportedValue(_isPasskeySupported);
      para.shortenLoginLink(window.location.href).then(loginLink => {
        setWebAuthURLForCreate(loginLink);
      });
      setIsUIReady(true);

      if (!_isPasskeySupported) {
        loginTimeout.current = window.setTimeout(sessionListener, KNOWN_DEVICE_LOGIN_POLLING_INTERVAL);
        return () => {
          window.clearTimeout(loginTimeout.current);
        };
      }
    })();
  }, []);

  return isUIReady ? (
    <FlexStartInnerContainer>
      <HeadingContainer>
        <CpslText weight="bold" variant="headingS">
          Create Passkey
        </CpslText>
        <CenteredText weight="medium" variant="bodyS" color="secondary">
          Your Passkey will allow you to safely reuse this wallet across the web.
        </CenteredText>
      </HeadingContainer>
      {isPasskeySupportedValue ? (
        <CpslButton fullWidth onClick={onCreateClick}>
          Create
        </CpslButton>
      ) : (
        <>
          <CpslText weight="semiBold">Scan with your mobile device</CpslText>
          <QRContainer>
            {!webAuthURLForCreate ? <CpslSpinner size={100} /> : <CpslQrCode url={webAuthURLForCreate} />}
          </QRContainer>
        </>
      )}
    </FlexStartInnerContainer>
  ) : undefined;
};

const HeadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
`;

const QRContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 286px;
  height: 286px;
`;
