import { ReactNode, useMemo } from 'react';
import { safeStyled } from '@getpara/react-common';
import { OAuth } from '../OAuth/OAuth.js';
import { TOAuthMethod } from '@getpara/web-sdk';
import { AuthInput } from '../AuthInput/AuthInput.js';
import { useExternalWallets } from '../../../provider/providers/ExternalWalletProvider.js';
import { useModalStore } from '../../stores/index.js';
import { CpslIcon, CpslText } from '@getpara/react-components';

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
  const guestAddFundsTab = useModalStore(state => state.guestAddFundsTab);

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

  return (
    <Container>
      {guestAddFundsTab && (
        <CompleteAccountSetup>
          <CompleteAccountIcon icon="stars02" size="16px" />
          <CpslText variant="bodyS" weight="bold">
            Complete account setup to{' '}
            {guestAddFundsTab === 'BUY' ? 'buy assets' : guestAddFundsTab === 'WITHDRAW' ? 'sell assets' : 'continue'}.
          </CpslText>
        </CompleteAccountSetup>
      )}
      {Content}
    </Container>
  );
};

const Container = safeStyled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CompleteAccountSetup = safeStyled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: var(--cpsl-color-text-primary);
  margin-bottom: 8px;
`;

const CompleteAccountIcon = safeStyled(CpslIcon)`
  --icon-color: var(--cpsl-color-text-primary);
`;
