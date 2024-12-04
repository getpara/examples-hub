import { ReactNode, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { OAuth } from '../OAuth/OAuth.js';
import { OAuthMethod } from '@usecapsule/web-sdk';
import { AuthInput } from '../AuthInput/AuthInput.js';
import { useExternalWallets } from '../../providers/ExternalWalletContext.js';
import { useModalStore, useUserInfoStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';

interface AuthOptionsProps {
  oAuthMethods?: OAuthMethod[];
  disableEmailLogin: boolean;
  disablePhoneLogin: boolean;
}

export const AuthOptions = ({ oAuthMethods, disableEmailLogin, disablePhoneLogin }: AuthOptionsProps) => {
  const { wallets } = useExternalWallets();
  const showAllOAuth = useModalStore(state => state.step === ModalStep.AUTH_MORE);
  const identifierType = useUserInfoStore(state => state.identifierType);
  const setIdentifierType = useUserInfoStore(state => state.setIdentifierType);
  const setIdentifier = useUserInfoStore(state => state.setIdentifier);

  const Content = useMemo(() => {
    const Methods: ReactNode[] = [];

    if (!!oAuthMethods?.length) {
      Methods.push(<OAuth key="oAuth" methods={oAuthMethods} />);
    }

    if (!disableEmailLogin || !disablePhoneLogin) {
      Methods.push(<AuthInput key="input" disableEmailLogin={disableEmailLogin} disablePhoneLogin={disablePhoneLogin} />);
    }

    return <>{Methods}</>;
  }, [showAllOAuth, oAuthMethods, disableEmailLogin, disablePhoneLogin, wallets]);

  useEffect(() => {
    if (identifierType === 'farcaster') {
      setIdentifierType(undefined);
      setIdentifier('');
    }
  }, [identifierType]);

  return <Container>{Content}</Container>;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
