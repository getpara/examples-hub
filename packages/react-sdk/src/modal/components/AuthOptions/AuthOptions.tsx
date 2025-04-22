import { ReactNode, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { OAuth } from '../OAuth/OAuth.js';
import { TOAuthMethod } from '@getpara/web-sdk';
import { AuthInput } from '../AuthInput/AuthInput.js';
import { useExternalWallets } from '../../../provider/providers/ExternalWalletProvider.js';
import { useModalStore } from '../../stores/index.js';
import { CpslIcon } from '@getpara/react-components';
import { useStore } from '../../../provider/stores/useStore.js';

interface AuthOptionsProps {
  oAuthMethods?: TOAuthMethod[];
  disableEmailLogin: boolean;
  disablePhoneLogin: boolean;
  isGuestModeEnabled: boolean;
}

export const AuthOptions = ({
  oAuthMethods,
  disableEmailLogin,
  disablePhoneLogin,
  isGuestModeEnabled = false,
}: AuthOptionsProps) => {
  const { wallets } = useExternalWallets();
  const isDark = useStore(state => state.modalConfig?.theme?.mode === 'dark');
  const guestAddFundsTab = useModalStore(state => state.guestAddFundsTab);
  const setGuestAddFundsTab = useModalStore(state => state.setGuestAddFundsTab);

  const Content = useMemo(() => {
    const Methods: ReactNode[] = [];

    if (!!oAuthMethods?.length) {
      Methods.push(<OAuth key="oAuth" methods={oAuthMethods} />);
    }

    if (!disableEmailLogin || !disablePhoneLogin) {
      Methods.push(<AuthInput key="input" disableEmailLogin={disableEmailLogin} disablePhoneLogin={disablePhoneLogin} />);
    }

    return <>{Methods}</>;
  }, [oAuthMethods, disableEmailLogin, disablePhoneLogin, isGuestModeEnabled, wallets]);

  useEffect(() => {
    return () => {
      setGuestAddFundsTab();
    };
  }, []);

  return (
    <Container>
      {guestAddFundsTab && (
        <CompleteAccountSetup isDark={isDark}>
          <CpslIcon icon="stars02" size="16px" />
          Complete account setup to{' '}
          {guestAddFundsTab === 'BUY' ? 'buy assets' : guestAddFundsTab === 'WITHDRAW' ? 'sell assets' : 'continue'}.
        </CompleteAccountSetup>
      )}
      {Content}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CompleteAccountSetup = styled.div<{ isDark?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: ${({ isDark }) => (isDark ? 'white' : 'black')};
  font-weight: 500;
  font-size: 14px;
`;
